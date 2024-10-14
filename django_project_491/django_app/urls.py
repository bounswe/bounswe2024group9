from django.urls import path
from .views import *

urlpatterns = [
    path('query/', wikidata_query_view, name='wikidata_query'),
    path('run_code/', run_code_view, name='run_code')
]
