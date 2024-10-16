from django.urls import path
from .views import search, wikidata_query_view, run_code_view, wikipedia_data_views

urlpatterns = [
    path('query/', wikidata_query_view, name='wikidata_query'),
    path('run_code/', run_code_view, name='run_code'),
    path('wikipedia/', wikipedia_data_views, name='wikipedia'),
    path('search/<str:search_strings>', search, name='search'),
]
