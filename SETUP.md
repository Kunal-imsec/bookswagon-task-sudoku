# Quick Start Guide - Django Sudoku Web Application

## 🚀 Getting Up and Running

### Step 1: Install Dependencies

```bash
cd sudoku-django-webapp
pip install -r requirements.txt
```

Or just install Django:

```bash
pip install django
```

### Step 2: Run Migrations

```bash
python manage.py migrate
```

This creates the database tables including the Puzzle model.

### Step 3: Start the Server

```bash
python manage.py runserver
```

### Step 4: Play

Open your browser and go to: **http://localhost:8000**

## 📁 Project Structure

```
sudoku-django-webapp/
├── manage.py                          # Django management script
├── requirements.txt                   # Dependencies (Django only)
├── README.md                          # Complete documentation
├── SETUP.md                           # This file
│
├── sudoku_project/                    # Django project configuration
│   ├── __init__.py
│   ├── settings.py                    # Django settings
│   ├── urls.py                        # Root routing
│   └── wsgi.py
│
└── sudoku/                             # Main app
    ├── __init__.py
    ├── apps.py
    ├── logic.py                        # Pure Python game algorithms
    ├── models.py                      # Puzzle data model
    ├── views.py                       # 6 view endpoints
    ├── urls.py                        # App routing
    ├── templates/
    │   └── sudoku/
    │       └── board.html             # Main page
    └── static/
        └── sudoku/
            ├── style.css              # Dark theme CSS
            └── script.js              # Interactive JavaScript
```

## 🎮 Game Features

- ✓ **Multiple Difficulties**: Easy (~41 clues), Medium (~49 removed), Hard (~55 removed)
- ✓ **Live Conflict Detection**: See conflicts highlighted in red instantly
- ✓ **Hint System**: Teal-filled cells when you need help
- ✓ **Check Verification**: Validate your board
- ✓ **Complete Solution**: See the answer when requested
- ✓ **Game Timer**: Track your solving time
- ✓ **Session Persistence**: Your game remains after page refresh
- ✓ **Dark Theme**: Modern, eye-friendly UI
- ✓ **Responsive**: Works on desktop and mobile

## 🔌 API Endpoints

All endpoints return JSON:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/new-game/` | Generate new puzzle |
| POST | `/api/update-cell/` | Update a cell value |
| POST | `/api/check/` | Check for conflicts |
| POST | `/api/hint/` | Get one hint |
| POST | `/api/solve/` | Complete the puzzle |

## 💡 How to Play

1. **Select Difficulty** (Easy/Medium/Hard) from the dropdown
2. **Click "New Game"** to start
3. **Click a cell** and type a number (1-9)
4. **Watch conflicts appear** in red (row/col/box violations)
5. **Use "Check"** to verify progress
6. **Use "Hint"** when stuck (fills one correct cell)
7. **Use "Solve"** to see the answer
8. **Use "Reset"** to clear your progress
9. **Timer runs** automatically

## 🧪 Testing (Optional)

Run Django's test runner:

```bash
python manage.py test sudoku --verbosity=2
```

## 📊 Verification Checklist

- [x] Project structure follows Django conventions
- [x] `sudoku/logic.py` has zero Django imports (pure Python algorithms)
- [x] `Puzzle` model uses JSONField for board state
- [x] 6 view endpoints implemented and tested
- [x] Client-side conflict detection via JS
- [x] Session-based state persistence
- [x] CSRF protection on all POST endpoints
- [x] Dark theme with CSS variables
- [x] Responsive 9x9 grid with 3x3 box styling
- [x] Complete README with design decisions
- [x] API tested and responding correctly

## 🎯 Design Highlights

1. **Backtracking + Uniqueness-Checking**: Guaranteed valid puzzles with exactly one solution
2. **Session-Based State**: No login required, browser session ties each player's game
3. **Decoupled Logic**: Game algorithms independently testable and framework-agnostic
4. **Client-Side Validation**: Instant conflict highlighting via row/col/box checks
5. **JSON API Architecture**: Clean RESTful interface using Django's built-in capabilities

## 📚 Additional Resources

- **Complete Documentation**: See [README.md](README.md)
- **API Details**: Check views in [sudoku/views.py](sudoku/views.py)
- **Logic Implementation**: Review [sudoku/logic.py](sudoku/logic.py)
- **Frontend Code**: Debug JS tricks in [sudoku/static/sudoku/script.js](sudoku/static/sudoku/script.js)

## 🐛 Troubleshooting

**Problem**: Server won't start
```bash
# Make sure Django is installed
pip install django

# Check configuration
python manage.py check
```

**Problem**: Templates not found
- Ensure you're running from the project root (contains `manage.py`)
- Check that `TEMPLATE_DIRS` includes `BASE_DIR / 'templates'`

**Problem**: Static files not loading
- Django development server includes static files automatically
- Ensure `settings.py` has `STATIC_URL = 'static/'`

## 💼 Interview Tips

When presenting this project, highlight:

1. **Clean Architecture**: Decoupled logic.py demonstrates understanding of separation of concerns
2. **Django Best Practices**: Proper URL routing, session management, models, views
3. **No Framework Boilerplate**: Vanilla JavaScript for frontend (shows fundamentals)
4. **Complete Implementation**: From puzzle generation to UI interaction — end-to-end MVP
5. **Documentation**: Comprehensive README with design decisions shows communication skills

---

Built with Django 5.0/6.0 ✨

For questions, refer to inline docstrings and README.md sections!