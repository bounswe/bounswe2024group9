from django.urls import path
from .views import wikidata_query_view

urlpatterns = [
    path('query/', wikidata_query_view, name='wikidata_query'),
]
