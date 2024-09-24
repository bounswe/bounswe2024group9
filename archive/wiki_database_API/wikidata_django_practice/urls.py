from django.contrib import admin
from django.urls import path, include
from .views import index 
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('wiki_search/', include('wiki_search.urls')),
    path('database_search/', include('database_search.urls')),
    path('', index, name='index'), 
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
