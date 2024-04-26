from django.urls import path
from .views import search, results

urlpatterns = [
    path('search/<str:search_strings>', search, name='search'),
    path('results/<str:QID>/', results, name='results'), 
]
