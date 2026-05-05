from django.urls import path
from . import views

urlpatterns = [
    path('', views.mentors_list_create, name='mentors-list-create'),
]
