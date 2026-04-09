from django.urls import path
from . import views

urlpatterns = [
    path('create-order/', views.create_order, name='create_order'),
    path('verify/', views.verify_payment, name='verify_payment'),
    path('invoice/<str:order_id>/', views.generate_invoice, name='generate_invoice'),
    path('orders/', views.list_orders, name='list_orders'),
]
