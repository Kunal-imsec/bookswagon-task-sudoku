"""
Pure Python Sudoku game logic module.
Contains algorithms for board validation, backtracking solving, uniqueness checking,
full board generation, and puzzle generation with various difficulty presets.
No Django dependencies.
"""

import random
from typing import List, Tuple, Optional

Board = List[List[int]]

def is_valid(board: Board, row: int, col: int, num: int) -> bool:
    """
    Check if placing 'num' at board[row][col] is valid according to Sudoku rules.
    Checks the row, column, and 3x3 subgrid.
    """
    # Check row
    if num in board[row]:
        return False

    # Check column
    for r in range(9):
        if board[r][col] == num:
            return False

    # Check 3x3 subgrid
    start_row = (row // 3) * 3
    start_col = (col // 3) * 3
    for r in range(start_row, start_row + 3):
        for c in range(start_col, start_col + 3):
            if board[r][c] == num:
                return False

    return True

def find_empty(board: Board) -> Optional[Tuple[int, int]]:
    """
    Find the next empty cell (represented by 0) on the board.
    Returns (row, col) tuple or None if board is full.
    """
    for r in range(9):
        for c in range(9):
            if board[r][c] == 0:
                return (r, c)
    return None

def solve(board: Board) -> bool:
    """
    Solve the Sudoku board using a backtracking algorithm.
    Mutates the board in place and returns True if solved, False otherwise.
    """
    empty = find_empty(board)
    if not empty:
        return True  # Puzzle solved

    row, col = empty

    for num in range(1, 10):
        if is_valid(board, row, col, num):
            board[row][col] = num

            if solve(board):
                return True

            board[row][col] = 0  # Backtrack

    return False

def count_solutions(board: Board, limit: int = 2) -> int:
    """
    Count the number of solutions for a given board up to a specified limit.
    Used to verify puzzle uniqueness (a valid puzzle must have exactly 1 solution).
    """
    count = 0

    def _solve_count(b: Board) -> None:
        nonlocal count
        if count >= limit:
            return

        empty = find_empty(b)
        if not empty:
            count += 1
            return

        row, col = empty
        for num in range(1, 10):
            if is_valid(b, row, col, num):
                b[row][col] = num
                _solve_count(b)
                b[row][col] = 0

    # Create a copy so we don't mutate the original board during counting
    board_copy = [row[:] for row in board]
    _solve_count(board_copy)
    return count

def generate_full_board() -> Board:
    """
    Generate a complete, valid, randomly solved 9x9 Sudoku board.
    """
    board = [[0] * 9 for _ in range(9)]

    # Fill diagonal 3x3 boxes first to optimize generation
    for i in range(0, 9, 3):
        nums = list(range(1, 10))
        random.shuffle(nums)
        for r in range(3):
            for c in range(3):
                board[i + r][i + c] = nums.pop()

    solve(board)
    return board

def generate_puzzle(difficulty: str) -> Tuple[Board, Board]:
    """
    Generate a Sudoku puzzle and its corresponding solution based on difficulty.
    Difficulty presets by target clue count:
      - Easy: ~40 clues (51 removed)
      - Medium: ~32 clues (49 removed / ~32 left, standard medium ~32-35)
      - Hard: ~26 clues (approx 26-28 clues left)
    Guarantees exactly ONE unique solution using count_solutions.
    Returns a tuple: (puzzle_board, solution_board)
    """
    solution = generate_full_board()
    puzzle = [row[:] for row in solution]

    # Target clues per difficulty
    clues_target = {
        'Easy': 40,
        'Medium': 32,
        'Hard': 26
    }.get(difficulty, 32)

    cells = [(r, c) for r in range(9) for c in range(9)]
    random.shuffle(cells)

    current_clues = 81

    for r, c in cells:
        if current_clues <= clues_target:
            break

        temp = puzzle[r][c]
        if temp == 0:
            continue

        puzzle[r][c] = 0

        # Verify uniqueness
        if count_solutions(puzzle, limit=2) != 1:
            # If not unique, restore cell
            puzzle[r][c] = temp
        else:
            current_clues -= 1

    return puzzle, solution
