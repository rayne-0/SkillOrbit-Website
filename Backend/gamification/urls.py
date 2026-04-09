from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.get_profile, name='gamification_profile'),
    path('award/', views.award_xp, name='gamification_award'),
    path('leaderboard/', views.get_leaderboard, name='gamification_leaderboard'),
]
