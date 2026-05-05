from django.urls import path
from . import views

urlpatterns = [
    path('', views.assignments_list_create, name='assignments-list-create'),
    path('<str:assignment_id>/', views.assignment_detail, name='assignment-detail'),
    path('<str:assignment_id>/grade/', views.grade_assignment, name='grade-assignment'),
]
