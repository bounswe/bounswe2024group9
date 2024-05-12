from django.contrib import admin
from django.urls import path, include
from .views import index 
urlpatterns = [
    path('admin/', admin.site.urls),
    path('wiki_search/', include('wiki_search.urls')),
    path('database_search/', include('database_search.urls')),
    path('', index, name='index'), 
]
