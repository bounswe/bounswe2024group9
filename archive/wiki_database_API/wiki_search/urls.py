from django.urls import path
from .views import search, results
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Wikidata and Database API",
        default_version='v1',
        description="Wikidata and Database API, takes string as input and makes search across Wikidata by using SPARQL queries. Also on the database side, it takes different kinds of inputs and makes operaritions about User and Routes",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('search/<str:search_strings>', search, name='search'),
    path('results/<str:QID>/', results, name='results'), 
]
