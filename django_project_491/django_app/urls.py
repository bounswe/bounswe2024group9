from django.urls import path
from .views import *

urlpatterns = [
    path('run_code/', run_code_view, name='run_code'),
    path('search/<str:search_strings>', wiki_search, name='wiki_search'),
    path('result/<str:wiki_id>', wiki_result, name='wiki_result'),
]
