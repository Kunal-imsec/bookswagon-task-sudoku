"""
Django models for the Sudoku application.
Stores game sessions and board states using JSONFields.
"""

from django.db import models
from django.db.models import JSONField

class Puzzle(models.Model):
    """
    Represents an active or completed Sudoku game session tied to a browser session.
    """
    DIFFICULTY_CHOICES = [
        ('Easy', 'Easy'),
        ('Medium', 'Medium'),
        ('Hard', 'Hard'),
    ]

    puzzle_board = JSONField(help_text="Original puzzle clues (9x9 grid)")
    solution_board = JSONField(help_text="Full solution grid (9x9 grid)")
    current_board = JSONField(help_text="User's current in-progress grid (9x9 grid)")
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='Medium')
    session_key = models.CharField(max_length=40, db_index=True, help_text="Django session key")
    started_at = models.DateTimeField(auto_now_add=True, help_text="Timestamp when puzzle was created")
    is_solved = models.BooleanField(default=False, help_text="Whether the puzzle has been successfully completed")

    def __str__(self):
        return f"Puzzle {self.id} ({self.difficulty}) - Solved: {self.is_solved}"
