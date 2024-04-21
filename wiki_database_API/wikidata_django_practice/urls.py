from django.contrib import admin
from django.urls import path, include
from .views import index  # Replace 'your_app_name' with the actual app name where you created the index view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('wiki_search/', include('wiki_search.urls')),
    path('database_search/', include('database_search.urls')),
    path('', index, name='index'),  # Add this line for the main page
]
