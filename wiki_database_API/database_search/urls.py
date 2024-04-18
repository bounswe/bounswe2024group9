from django.urls import path
from . import views

urlpatterns = [
    path('routes/', views.route_list, name='route_list'),
    path('routes/<int:pk>/', views.route_detail, name='route_detail'),
    path('nodes/', views.node_list, name='node_list'),
    path('nodes/<int:pk>/', views.node_detail, name='node_detail'),
]
