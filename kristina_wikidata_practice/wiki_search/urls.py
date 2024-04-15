from django.urls import path
from .views import search, top_5_nearby, top_5_period

urlpatterns = [
    path('search/', search, name='search'),
    path('top_5_nearby/', top_5_nearby, name='top_5_nearby'),
    path('top_5_period/', top_5_period, name='top_5_period'),

]
