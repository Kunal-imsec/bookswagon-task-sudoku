# -*- coding: utf-8 -*-
from __future__ import unicode_literals

# This will make sure the app is always imported when
# Django starts so that shared_task will use this app.
from . import apps

default_app_config = 'sudoku.apps.SudokuConfig'