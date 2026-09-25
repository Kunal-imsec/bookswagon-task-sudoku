from django.urls import path
from . import views

urlpatterns = [
    path('', views.board_view, name='board'),
    path('api/new-game/', views.new_game_view, name='new_game'),
    path('api/update-cell/', views.update_cell_view, name='update_cell'),
    path('api/check/', views.check_view, name='check'),
    path('api/hint/', views.hint_view, name='hint'),
    path('api/solve/', views.solve_view, name='solve'),
]