// Sudoku Game Frontend JavaScript
// Handles user interactions, AJAX calls, and UI updates

class SudokuGame {
    constructor() {
        this.boardSize = 9;
        this.timerInterval = null;
        this.startTime = null;
        this.elapsedTime = 0;
        this.isRunning = false;

        // DOM Elements
        this.boardElement = document.getElementById('sudoku-board');
        this.timerElement = document.getElementById('timer');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.checkBtn = document.getElementById('check-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.solveBtn = document.getElementById('solve-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.difficultySelect = document.getElementById('difficulty');
        this.messageBox = document.getElementById('message-box');
        this.messageText = document.getElementById('message-text');
        this.okBtn = document.getElementById('ok-btn');

        // Game state
        this.puzzleBoard = [];
        this.solutionBoard = [];
        this.currentBoard = [];
        this.difficulty = 'Medium';

        // Bind events
        this.bindEvents();

        // Initialize empty board
        this.initEmptyBoard();
    }

    bindEvents() {
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.checkBtn.addEventListener('click', () => this.checkBoard());
        this.hintBtn.addEventListener('click', () => this.getHint());
        this.solveBtn.addEventListener('click', () => this.solveBoard());
        this.resetBtn.addEventListener('click', () => this.resetBoard());
        this.okBtn.addEventListener('click', () => this.hideMessage());

        // Handle keyboard Enter for OK button
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.messageBox.classList.contains('visible')) {
                this.hideMessage();
            }
        });
    }

    initEmptyBoard() {
        // Create 9x9 grid of input cells
        this.boardElement.innerHTML = '';
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                const input = document.createElement('input');
                input.type = 'number';
                input.min = '1';
                input.max = '9';
                input.maxLength = '1';
                input.dataset.row = row;
                input.dataset.col = col;

                // Real-time validation on input
                input.addEventListener('input', (e) => {
                    this.handleCellInput(e.target);
                });

                // Prevent non-numeric input
                input.addEventListener('keydown', (e) => {
                    if (!/^[0-9]$/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Tab') {
                        e.preventDefault();
                    }
                });

                cell.appendChild(input);
                this.boardElement.appendChild(cell);
            }
        }
    }

    handleCellInput(inputElement) {
        const value = inputElement.value.trim();
        const row = parseInt(inputElement.dataset.row);
        const col = parseInt(inputElement.dataset.col);

        // Clear if empty or invalid
        if (value === '' || !/^[1-9]$/.test(value)) {
            inputElement.value = '';
            this.updateCell(row, col, 0);
            return;
        }

        const num = parseInt(value);
        if (num < 1 || num > 9) {
            inputElement.value = '';
            this.updateCell(row, col, 0);
            return;
        }

        // Update cell via AJAX
        this.updateCell(row, col, num);

        // Client-side conflict highlighting (lightweight JS validation)
        this.highlightConflicts(row, col, num);
    }

    highlightConflicts(row, col, num) {
        // Remove previous highlights
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('conflict-cell');
        });

        // Check for conflicts in row, column, and box
        const conflicts = [];

        // Check row
        for (let c = 0; c < this.boardSize; c++) {
            if (c !== col) {
                const cellInput = this.getCellInput(row, c);
                if (cellInput && parseInt(cellInput.value) === num) {
                    conflicts.push(this.getCellElement(row, c));
                    conflicts.push(this.getCellElement(row, col));
                }
            }
        }

        // Check column
        for (let r = 0; r < this.boardSize; r++) {
            if (r !== row) {
                const cellInput = this.getCellInput(r, col);
                if (cellInput && parseInt(cellInput.value) === num) {
                    conflicts.push(this.getCellElement(r, col));
                    conflicts.push(this.getCellElement(row, col));
                }
            }
        }

        // Check 3x3 box
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;

        for (let r = startRow; r < startRow + 3; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if ((r !== row || c !== col)) {
                    const cellInput = this.getCellInput(r, c);
                    if (cellInput && parseInt(cellInput.value) === num) {
                        conflicts.push(this.getCellElement(r, c));
                        conflicts.push(this.getCellElement(row, col));
                    }
                }
            }
        }

        // Apply conflict highlighting
        conflicts.forEach(cell => {
            if (cell) {
                cell.classList.add('conflict-cell');
            }
        });
    }

    getCellElement(row, col) {
        const index = row * this.boardSize + col;
        return this.boardElement.children[index];
    }

    getCellInput(row, col) {
        const cell = this.getCellElement(row, col);
        return cell ? cell.querySelector('input') : null;
    }

    async updateCell(row, col, value) {
        try {
            const response = await fetch('/api/update-cell/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ row, col, value })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.current_board) {
                this.currentBoard = data.current_board;
                // Update UI if needed
                this.syncBoardWithModel();
            }

            return data;
        } catch (error) {
            console.error('Error updating cell:', error);
            this.showMessage('Error updating cell. Please try again.');
            return null;
        }
    }

    async newGame() {
        const difficulty = this.difficultySelect.value;
        this.difficulty = difficulty;

        try {
            const response = await fetch('/api/new-game/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ difficulty })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.loadGameData(data);
            this.startTimer();

        } catch (error) {
            console.error('Error starting new game:', error);
            this.showMessage('Error starting new game. Please try again.');
        }
    }

    loadGameData(data) {
        this.puzzleBoard = data.puzzle_board;
        this.solutionBoard = data.solution_board || [];
        this.currentBoard = data.current_board || [];

        // Update the UI
        this.updateBoardUI();
    }

    updateBoardUI() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cellInput = this.getCellInput(row, col);
                if (!cellInput) continue;

                const puzzleValue = this.puzzleBoard[row][col];
                const currentValue = this.currentBoard[row][col];

                // Set value
                cellInput.value = currentValue !== 0 ? currentValue.toString() : '';

                // Set cell styles
                const cellElement = this.getCellElement(row, col);
                cellElement.classList.remove('clue-cell', 'user-cell', 'hint-cell', 'correct-cell', 'conflict-cell');

                if (puzzleValue !== 0) {
                    // Original clue - read-only and styled
                    cellInput.readOnly = true;
                    cellElement.classList.add('clue-cell');
                } else {
                    // User-editable cell
                    cellInput.readOnly = false;
                    cellElement.classList.add('user-cell');

                    // Check if it matches solution (for correct but not hint styling)
                    if (currentValue !== 0 && currentValue === this.solutionBoard[row][col]) {
                        cellElement.classList.add('correct-cell');
                    }
                }
            }
        }
    }

    async checkBoard() {
        try {
            const response = await fetch('/api/check/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.conflicts && data.conflicts.length > 0) {
                this.highlightConflictsFromServer(data.conflicts);
                this.showMessage(`Found ${data.conflicts.length} conflict(s)!`);
            } else {
                // No conflicts - check if board is complete
                const isComplete = this.currentBoard.every(row =>
                    row.every(cell => cell !== 0)
                );

                if (isComplete) {
                    // Board is full and no conflicts - player won!
                    this.stopTimer();
                    this.showMessage('Congratulations! You solved the puzzle!');
                    // Mark as solved via solve endpoint to update model
                    await this.solveBoard(false); // false means don't show solution
                } else {
                    this.showMessage('No conflicts found! Keep going...');
                }
            }
        } catch (error) {
            console.error('Error checking board:', error);
            this.showMessage('Error checking board. Please try again.');
        }
    }

    highlightConflictsFromServer(conflicts) {
        // Clear previous highlights
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('conflict-cell');
        });

        // Apply server-reported conflicts
        conflicts.forEach(conflict => {
            const cell = this.getCellElement(conflict.row, conflict.col);
            if (cell) {
                cell.classList.add('conflict-cell');
            }
        });
    }

    async getHint() {
        try {
            const response = await fetch('/api/hint/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) {
                this.showMessage(data.error);
                return;
            }

            // Update the specific cell with hint
            const row = data.row;
            const col = data.col;
            const value = data.value;

            const cellInput = this.getCellInput(row, col);
            if (cellInput) {
                cellInput.value = value.toString();
                this.currentBoard[row][col] = value;

                // Style as hint cell
                const cellElement = this.getCellElement(row, col);
                cellElement.classList.remove('user-cell', 'correct-cell');
                cellElement.classList.add('hint-cell');
            }

            this.showMessage('Hint provided!');
        } catch (error) {
            console.error('Error getting hint:', error);
            this.showMessage('Error getting hint. Please try again.');
        }
    }

    async solveBoard(showSolution = true) {
        try {
            const response = await fetch('/api/solve/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.stopTimer();

            if (showSolution && data.current_board) {
                this.currentBoard = data.current_board;
                this.updateBoardUI();
                // Mark all user cells as solved/correct
                for (let row = 0; row < this.boardSize; row++) {
                    for (let col = 0; col < this.boardSize; col++) {
                        if (this.puzzleBoard[row][col] === 0) {
                            const cellElement = this.getCellElement(row, col);
                            if (cellElement) {
                                cellElement.classList.remove('user-cell');
                                cellElement.classList.add('correct-cell');
                            }
                        }
                    }
                }
            }

            this.showMessage('Puzzle solved!');
        } catch (error) {
            console.error('Error solving board:', error);
            this.showMessage('Error solving puzzle. Please try again.');
        }
    }

    resetBoard() {
        // Reset to original puzzle state (keep clues, clear user entries)
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.puzzleBoard[row][col] === 0) {
                    // User-editable cell - clear it
                    const cellInput = this.getCellInput(row, col);
                    if (cellInput) {
                        cellInput.value = '';
                        this.currentBoard[row][col] = 0;
                    }

                    // Reset styling to user-cell
                    const cellElement = this.getCellElement(row, col);
                    if (cellElement) {
                        cellElement.classList.remove('hint-cell', 'correct-cell', 'conflict-cell');
                        cellElement.classList.add('user-cell');
                    }
                }
                // Clue cells remain unchanged
            }
        }

        this.stopTimer();
        this.startTimer(); // Restart timer
        this.showMessage('Board reset!');
    }

    startTimer() {
        this.stopTimer(); // Ensure clean start
        this.startTime = Date.now() - this.elapsedTime;
        this.isRunning = true;
        this.updateTimer();
    }

    stopTimer() {
        if (this.isRunning) {
            this.elapsedTime = Date.now() - this.startTime;
            this.isRunning = false;
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimer() {
        if (!this.isRunning) return;

        this.elapsedTime = Date.now() - this.startTime;
        const totalSeconds = Math.floor(this.elapsedTime / 1000);
        const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');

        this.timerElement.textContent = `${minutes}:${seconds}`;

        this.timerInterval = setTimeout(() => this.updateTimer(), 1000);
    }

    showMessage(message) {
        this.messageText.textContent = message;
        this.messageBox.classList.remove('hidden');
        this.messageBox.classList.add('visible');
    }

    hideMessage() {
        this.messageBox.classList.remove('visible');
        this.messageBox.classList.add('hidden');
    }
}

// Helper function to get CSRF cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sudokuGame = new SudokuGame();

    // Auto-start a new game on first load
    setTimeout(() => {
        window.sudokuGame.newGame();
    }, 100);
});