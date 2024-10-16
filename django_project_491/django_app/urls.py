from django.urls import path
from .views import *

urlpatterns = [
    path('query/', wikidata_query_view, name='wikidata_query'),
    path('run_code/', run_code_view, name='run_code'),
    path('wikipedia/', wikipedia_data_views, name='wikipedia'),
    path('search/<str:search_strings>', wiki_search, name='wiki_search'),
    path('result/<str:wiki_id>', wiki_result, name='wiki_result'),
]
