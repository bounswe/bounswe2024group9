from django.contrib import admin
from .models import Route, Node

admin.site.register(Route)
admin.site.register(Node)

# to use it python manage.py createsuperuser
# loging to admin panel from localhost:8000/admin
# create and edit routes and nodes