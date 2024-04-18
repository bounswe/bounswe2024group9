from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
# Django version bigger than 3.1 for JSONField


class Node(models.Model):
    name = models.CharField(max_length=255)
    node_id = models.AutoField(primary_key=True)
    photo = models.URLField()

    def __str__(self):
        return self.name

class Route(models.Model):
    route_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    photos = models.JSONField(default=list, blank=True) 
    rating = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(5)])
    likes = models.PositiveIntegerField(default=0)
    comments = models.JSONField(default=list, blank=True) 
    saves = models.PositiveIntegerField(default=0)
    nodes = models.ManyToManyField(Node, related_name='routes')
    duration = models.JSONField(default=list, blank=True)  # Time spent in the location
    duration_between = models.JSONField(default=list, blank=True)  #Time spent between locations like 15 min between node 1 and 2
    mapView = models.URLField()


# When a field is changed in the model, the database must be updated.
# To do this, run the following commands:
# python manage.py makemigrations
# python manage.py migrate
# These commands will update the database schema to match the model.