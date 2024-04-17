from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('wiki_search/', include('wiki_search.urls')),
    path('database_search/', include('database_search.urls')),
]
