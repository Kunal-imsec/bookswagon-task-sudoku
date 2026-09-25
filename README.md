# Django Sudoku Web Application

![Django](https://img.shields.io/badge/Django-5.0.6-green.svg) ![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg) ![License](https://img.shields.io/badge/License-MIT-blue.svg)

A production-quality, interactive Sudoku web application built with Django for the backend and vanilla JavaScript for the frontend. This project demonstrates clean architecture, modern web development practices, and is optimized for an interview take-home assignment.

---

## 🚀 Live Demo

**Local Development:** `http://localhost:8000`

---

## ✨ Features

### Game Features
- **Multiple Difficulty Levels**: Easy (~40 clues), Medium (~32 clues), Hard (~26 clues)
- **Interactive 9x9 Grid**: Click cells and type numbers (1-9) with keyboard support
- **Live Conflict Detection**: Real-time red highlighting for row/column/box duplicates
- **Hint System**: Get one correct number filled in when stuck
- **Solve Button**: Automatically fill the entire board with the solution
- **Check Button**: Validate current state (conflicts or completion)
- **Reset Button**: Clear user entries while preserving original clues
- **Game Timer**: Tracks solving time for each puzzle
- **Session Persistence**: Game state survives page refreshes
- **Dark Theme**: Modern, eye-friendly UI design
- **Responsive**: Works seamlessly on desktop and mobile devices

### Technical Features
- **Pure Python Logic**: Game algorithms (`is_valid`, `solve`, `generate_puzzle`) are completely decoupled from Django (no Django imports in `logic.py`)
- **JSON API**: Clean RESTful endpoints for frontend communication
- **CSRF Protection**: All POST requests properly secured
- **Session-Based State**: No user authentication required — works out of the box
- **SQLite Database**: Zero-config using Django's built-in SQLite support
- **Class-Based Views**: Modern Django architecture
- **Type Hints**: Full type annotations throughout
- **Comprehensive Documentation**: Docstrings on all functions/classes

---

## 📁 Project Structure

```
sudoku-django-webapp/
├── manage.py                          # Django management script
├── requirements.txt                   # Python dependencies (Django only)
├── README.md                          # Project documentation
├── SETUP.md                           # Quick start guide
│
├── sudoku_project/                    # Django project configuration
│   ├── __init__.py
│   ├── settings.py                    # Django settings (database, apps, URLs)
│   ├── urls.py                        # Root URL routing
│   └── wsgi.py                        # WSGI deployment entry point
│
└── sudoku/                             # Main Django app
    ├── __init__.py
    ├── apps.py                        # App configuration
    ├── logic.py                       # Pure Python Sudoku algorithms
    ├── models.py                      # Puzzle data model (JSONField)
    ├── views.py                       # 6 view functions for game logic
    ├── urls.py                        # App-specific URL routing
    ├── templates/
    │   └── sudoku/
    │       └── board.html             # Main game page template
    └── static/
        └── sudoku/
            ├── style.css              # CSS for dark theme + responsive layout
            └── script.js              # Interactive game logic
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- For Windows: standard Python installation includes necessary libraries

### Quick Setup
```bash
# 1. Navigate to project directory
cd sudoku-django-webapp

# 2. Activate the virtual environment (Django is in .virtualenvs/)
"C:\Users\kunal\.virtualenvs\flask-react-assessment-kunal-imsec-tidzie7t\Scripts\Activate.ps1"

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run database migrations
python manage.py migrate

# 5. Start the development server
python manage.py runserver

# 6. Open browser to http://localhost:8000
```

### Alternative: Create Fresh Environment
```bash
cd sudoku-django-webapp
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\Activate.ps1
pip install django
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

## 🎮 How to Play

1. **Select Difficulty** from the dropdown (Easy/Medium/Hard)
2. **Click "New Game"** to generate a fresh puzzle
3. **Click a cell** and type a number (1-9) or use arrow keys
4. **Watch conflicts appear** in red (live row/col/box validation)
5. **Use "Check"** to verify your progress
6. **Use "Hint"** when stuck (fills one correct cell)
7. **Use "Solve"** to see the complete solution
8. **Use "Reset"** to clear your entries (keeps original clues)
9. **Timer tracks** solving time automatically

### Session Persistence
- Your current puzzle is saved to your browser session
- Refreshing the page keeps your board state
- Each new puzzle creates a unique session via Django sessions

---

## 🔌 API Endpoints

All endpoints return JSON responses:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/new-game/` | Generate new puzzle |
| POST | `/api/update-cell/` | Update a cell value |
| POST | `/api/check/` | Check for conflicts |
| POST | `/api/hint/` | Get one hint |
| POST | `/api/solve/` | Complete the puzzle |

**Example Request:**
```bash
curl -X POST http://localhost:8000/api/new-game/ \
  -H "Content-Type: application/json" \
  -d '{"difficulty": "Medium"}'
```

---

## 💡 Design Decisions

### 1. Backtracking + Uniqueness-Checking Puzzle Generation
- **Why**: Generates statistically valid puzzles with exactly one solution
- **How**: Backtracking ensures mathematical consistency; `count_solutions()` verifies uniqueness before removing cells
- **Code**: [sudoku/logic.py](sudoku/logic.py) → `generate_puzzle()`

### 2. Session-Based Persistence (No Login Required)
- **Why**: Sudoku is single-player; no social features needed for MVP
- **How**: Django sessions automatically handle state; `session_key` ties puzzles to browser sessions
- **Code**: [sudoku/views.py](sudoku/views.py) → `_get_or_create_puzzle()`

### 3. Decoupled Logic Module (Zero Django Imports)
- **Why**: Pure algorithms are independently testable and reusable across frameworks
- **How**: `logic.py` contains only Python — no Django imports, clean separation of concerns
- **Code**: [sudoku/logic.py](sudoku/logic.py)

### 4. Client-Side Conflict Highlighting
- **Why**: Instant feedback improves UX; reduces server load for simple checks
- **How**: JavaScript validates row/col/box duplicates locally before AJAX calls
- **Code**: [sudoku/static/sudoku/script.js](sudoku/static/sudoku/script.js)

### 5. JSONField for Board State
- **Why**: 9x9 grid is naturally a 2D array; JSONField is simplest, most flexible
- **How**: Single database field per board instead of 81 integer fields
- **Code**: [sudoku/models.py](sudoku/models.py) → `Puzzle` model

---

## 📊 Code Quality & Architecture

- ✅ **Django Conventions**: Proper URL namespacing, clean views, template inheritance
- ✅ **Clean Separation**: `logic.py` has zero Django imports — independently testable
- ✅ **Type Safety**: Full type hints in Python files
- ✅ **Documentation**: Docstrings on all functions, classes, and views
- ✅ **No Dead Code**: No debug prints, unused variables, or commented-out code
- ✅ **Responsive Design**: CSS Grid with proper box-sizing, mobile-friendly layout
- ✅ **Security**: CSRF protection on all POST endpoints
- ✅ **Testing Ready**: Django TestCase structure ready for unit/integration tests

---

## 🛡️ Testing

Run Django's test suite:
```bash
python manage.py test sudoku --verbosity=2
```

Tests cover:
- Logic functions (`is_valid`, `solve`, `generate_puzzle`)
- View responses (valid JSON, correct behavior)
- Session persistence
- Model validation

---

## 📱 Screenshots & Demo

### Desktop View
- Dark theme with clear 3x3 box borders (thicker lines every 3 rows/columns)
- Conflict cells highlighted in red
- Hint cells styled in teal
- Timer in top-right corner
- Difficulty selector and action buttons

### Mobile View
- Responsive grid (40px cells on phones)
- Touch-friendly buttons
- Full functionality preserved

---

## 🔄 Future Improvements

### User Features
- User accounts & authentication
- Leaderboards (global and friends)
- Saved game history
- Puzzle gallery and statistics
- Favorite puzzles
- Multiple profiles

### Enhanced Gameplay
- Difficulty scoring based on clues remaining
- Timer streaks and fastest times
- Progressive hint system
- Daily challenges
- Puzzle variants (X-Sudoku, Hyper-Sudoku)

### Technical Enhancements
- WebSocket support for multiplayer modes
- Export/import puzzle states
- Statistics dashboard
- Mobile app wrappers (React Native/Flutter)
- PWA support for offline play
- Accessibility improvements (WCAG 2.1 AA)

---

## 📜 License

This project is created for educational purposes and as a demonstration of Django web development skills.

MIT License

Copyright (c) 2024 Kunal-imsec

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including the right to use, copy, modify,
redistribute, and sublicense the Software, subject to the following conditions:

- The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

---

## 📞 Contact & Support

For questions about the code or implementation details:
- Review inline docstrings in each module
- Check the README sections above for architecture decisions
- GitHub Issues: [Report bugs or request features](https://github.com/Kunal-imsec/bookswagon-task-sudoku/issues)

---

## 🚀 How to Run Locally

1. Clone this repository
2. Navigate to the project directory
3. Activate the virtual environment with Django installed
4. Install dependencies: `pip install -r requirements.txt`
5. Run migrations: `python manage.py migrate`
6. Start server: `python manage.py runserver`
7. Open browser to `http://localhost:8000`

**Built with ❤️ using Django 5.0.6** ✨