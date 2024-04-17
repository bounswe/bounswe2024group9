from django.db import models
# Django version bigger than 3.1 for JSONField

class Route(models.Model):
    route_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    photos = models.JSONField(default=list, blank=True)  # Stores a list of photo URLs as JSON
    rating = models.FloatField()
    likes = models.PositiveIntegerField(default=0)
    comments = models.JSONField(default=list, blank=True)  # Stores comments as JSON
    saves = models.PositiveIntegerField(default=0)
    nodes = models.JSONField(default=list, blank=True)  # Stores node IDs as JSON
    duration = models.JSONField(default=list, blank=True)  # Stores durations as JSON
    duration_between = models.JSONField(default=list, blank=True)  # Stores durations between nodes as JSON
    mapView = models.URLField()

class Node(models.Model):
    name = models.CharField(max_length=255)
    node_id = models.AutoField(primary_key=True)
    photo = models.URLField()

    def __str__(self):
        return self.name
