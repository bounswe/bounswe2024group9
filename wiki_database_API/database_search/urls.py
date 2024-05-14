from django.urls import path
from . import views

urlpatterns = [
    path('routes/', views.route_list, name='route_list'),
    path('routes/<int:pk>/', views.route_detail, name='route_detail'),
    path('nodes/', views.node_list, name='node_list'),
    path('nodes/<int:pk>/', views.node_detail, name='node_detail'),
    path('users/', views.user_list, name='user_list'),
    path('users/<int:pk>/', views.user_detail, name='user_detail'),
    path('create_user/', views.create_user, name='create_user'),
    path('create_node/', views.create_node, name='create_node'),
    path('create_route/', views.create_route, name = 'create_route'),
    path('login/', views.login_user, name='login_user'),
    path('logout/', views.logout_user, name='logout_user'),
    path('delete_route/', views.delete_route, name = 'delete_route')
]
