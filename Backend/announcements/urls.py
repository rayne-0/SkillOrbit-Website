from django.urls import path
from . import views

urlpatterns = [
    path('', views.announcements_list_create, name='announcements-list-create'),
    path('all/read/', views.mark_all_read, name='announcements-mark-all-read'),
    path('<str:ann_id>/', views.announcement_detail_delete, name='announcement-detail-delete'),
    path('<str:ann_id>/read/', views.mark_read, name='announcement-mark-read'),
]
