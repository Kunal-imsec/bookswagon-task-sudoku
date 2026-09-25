"""
Views for the Sudoku application.
Handles game logic, session persistence, and JSON API endpoints for the frontend.
"""

import json
import logging
import random
from django.shortcuts import render
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from .logic import generate_puzzle, is_valid, solve, generate_full_board
from .models import Puzzle

logger = logging.getLogger(__name__)


def _get_or_create_puzzle(request) -> Puzzle:
    """
    Get or create a Puzzle instance for the current session.
    Ensures each session has its own persistent puzzle state.
    """
    session_key = request.session.session_key
    if not session_key:
        request.session.create()
        session_key = request.session.session_key

    puzzle, created = Puzzle.objects.get_or_create(
        session_key=session_key,
        defaults={
            'difficulty': 'Medium',
            'puzzle_board': [[0]*9 for _ in range(9)],
            'solution_board': [[0]*9 for _ in range(9)],
            'current_board': [[0]*9 for _ in range(9)],
            'is_solved': False
        }
    )
    return puzzle


@require_http_methods(["GET"])
def board_view(request):
    """
    Main page view - renders the Sudoku board template.
    Handles initial page loads and returns existing puzzle state if any.
    """
    puzzle = _get_or_create_puzzle(request)

    context = {
        'puzzle_board': puzzle.puzzle_board,
        'solution_board': puzzle.solution_board,
        'current_board': puzzle.current_board,
        'difficulty': puzzle.difficulty,
        'csrf_token': get_token(request),
        'is_solved': puzzle.is_solved
    }
    return render(request, 'sudoku/board.html', context)


@csrf_exempt
@require_http_methods(["POST"])
def new_game_view(request):
    """
    Generates a new puzzle based on selected difficulty.
    Saves the puzzle to session and model state.
    Returns JSON with the new puzzle state.
    """
    try:
        data = json.loads(request.body)
        difficulty = data.get('difficulty', 'Medium')
    except (json.JSONDecodeError, KeyError):
        return HttpResponseBadRequest("Invalid request body")

    if difficulty not in ['Easy', 'Medium', 'Hard']:
        return HttpResponseBadRequest("Invalid difficulty level")

    # Generate new puzzle
    puzzle_board, solution_board = generate_puzzle(difficulty)

    # Update or create puzzle record
    puzzle = _get_or_create_puzzle(request)
    puzzle.puzzle_board = puzzle_board
    puzzle.solution_board = solution_board
    puzzle.current_board = [row[:] for row in puzzle_board]  # Start with clues only
    puzzle.difficulty = difficulty
    puzzle.is_solved = False
    puzzle.save()

    response_data = {
        'puzzle_board': puzzle_board,
        'solution_board': solution_board,
        'current_board': puzzle.current_board,
        'is_solved': False
    }

    return JsonResponse(response_data)


@csrf_exempt
@require_http_methods(["POST"])
def update_cell_view(request):
    """
    Updates a cell value on the board.
    Validates the move and returns validation info.
    """
    try:
        data = json.loads(request.body)
        row = int(data['row'])
        col = int(data['col'])
        value = int(data['value'])
    except (json.JSONDecodeError, KeyError, ValueError):
        return HttpResponseBadRequest("Invalid request data")

    if not (0 <= row < 9 and 0 <= col < 9):
        return HttpResponseBadRequest("Row and column must be between 0-8")
    if value not in range(0, 10):  # 0 for empty, 1-9 for numbers
        return HttpResponseBadRequest("Value must be between 0-9")

    puzzle = _get_or_create_puzzle(request)

    # Don't allow modification of original clues
    if puzzle.puzzle_board[row][col] != 0:
        return JsonResponse({
            'valid': False,
            'reason': 'Cannot modify original clue',
            'current_board': puzzle.current_board
        })

    # Update the board
    puzzle.current_board[row][col] = value
    puzzle.save()

    # Validate the move (only if value is non-zero)
    valid = True
    if value != 0:
        valid = is_valid(puzzle.current_board, row, col, value)

    response_data = {
        'valid': valid,
        'current_board': puzzle.current_board,
        'row': row,
        'col': col,
        'value': value
    }

    return JsonResponse(response_data)


@csrf_exempt
@require_http_methods(["POST"])
def check_view(request):
    """
    Checks the entire board for conflicts.
    Returns a list of conflicting cells.
    """
    puzzle = _get_or_create_puzzle(request)
    board = puzzle.current_board

    conflicts = []
    for r in range(9):
        for c in range(9):
            num = board[r][c]
            if num != 0:
                # Temporarily clear the cell to check validity
                board[r][c] = 0
                if not is_valid(board, r, c, num):
                    conflicts.append({'row': r, 'col': c})
                board[r][c] = num  # Restore

    return JsonResponse({'conflicts': conflicts})


@csrf_exempt
@require_http_methods(["POST"])
def hint_view(request):
    """
    Provides one hint - fills in a random empty cell with the correct value.
    """
    puzzle = _get_or_create_puzzle(request)

    # Find empty cells
    empty_cells = []
    for r in range(9):
        for c in range(9):
            if puzzle.current_board[r][c] == 0:
                empty_cells.append((r, c))

    if not empty_cells:
        return JsonResponse({'error': 'No empty cells to hint'})

    # Pick a random empty cell
    r, c = random.choice(empty_cells)
    correct_value = puzzle.solution_board[r][c]

    # Update the board
    puzzle.current_board[r][c] = correct_value
    puzzle.save()

    return JsonResponse({
        'row': r,
        'col': c,
        'value': correct_value,
        'current_board': puzzle.current_board
    })


@csrf_exempt
@require_http_methods(["POST"])
def solve_view(request):
    """
    Returns the full solution and marks the puzzle as solved.
    """
    puzzle = _get_or_create_puzzle(request)

    # Fill board with solution
    puzzle.current_board = [row[:] for row in puzzle.solution_board]
    puzzle.is_solved = True
    puzzle.save()

    return JsonResponse({
        'solution_board': puzzle.solution_board,
        'current_board': puzzle.current_board,
        'is_solved': True
    })