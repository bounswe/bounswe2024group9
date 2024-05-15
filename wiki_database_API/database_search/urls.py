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
    path('load_feed/', views.feed_view, name='feed_view'),
    path('load_feed_via_id/', views.feed_view_via_id_web, name='feed_view_via_id'),
    path('delete_route/', views.delete_route, name = 'delete_route'),
    path('routes/by_qid/<str:qid>/', views.get_routes_by_qid, name='get_routes_by_qid'),
    path('follow_user/', views.follow_user, name='follow_user'),
    path('unfollow_user/', views.unfollow_user, name='unfollow_user'),
    path('check_following/<int:user_id>/', views.check_following, name='check_following'),
    path('check_like/', views.check_like, name='check_likes'),
    path('check_bookmark/', views.check_bookmark, name='check_bookmarks'),
    path('load_bookmarks/', views.load_bookmarks, name='load_bookmarks'),
    path('like_route/', views.like_route, name='like_route'),
    path('bookmark_route/', views.bookmark_route, name='bookmark_route'),
]
