from django.urls import path
from .views import *
from django.contrib.auth.views import LoginView

urlpatterns = [
    path('query/', wikidata_query_view, name='wikidata_query'),
    path('run_code/', run_code_view, name='run_code'),
    path('wikipedia/', wikipedia_data_views, name='wikipedia'),
    path('login/', LoginView.as_view(template_name='login.html'), name='login'),
]
