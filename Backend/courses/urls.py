from django.urls import path
from . import views

urlpatterns = [
    # Admin & Public Course endpoints
    path('admin/stats/', views.admin_dashboard_stats, name='admin-dashboard-stats'),
    path('', views.courses_list_create, name='courses-list-create'),
    path('<str:course_id>/', views.course_detail_update_delete, name='course-detail-update-delete'),
    
    # Enrollment endpoints
    path('<str:course_id>/enroll/', views.enroll_in_course, name='course-enroll'),
    path('user/enrolled/', views.get_user_enrollments, name='user-enrolled'),
    
    # Progress endpoints
    path('<str:course_id>/progress/', views.course_progress, name='course-progress'),
    
    # Notes endpoints
    path('<str:course_id>/notes/', views.course_notes, name='course-notes'),
]
