from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator

class Route(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    photos = models.JSONField()  # A JSON field to store a list of photo URLs.
    rating = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(5.0)])
    likes = models.PositiveIntegerField(default=0)
    comments = models.JSONField()  # A JSON field to store a list of comments.
    saves = models.PositiveIntegerField(default=0)
    nodes = models.JSONField()  # A JSON field to store a list of node identifiers or other data.
    mapView = models.URLField()  # Assuming mapView is a URL to an image or other resource.

    def __str__(self):
        return self.title

class User(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    profilePicture = models.URLField(blank=True)  # Assuming this is a URL.
    routes = models.ManyToManyField(Route, related_name='users_routes', blank=True)
    followers = models.ManyToManyField('self', symmetrical=False, related_name='is_followed_by', blank=True)
    following = models.ManyToManyField('self', symmetrical=False, related_name='is_following', blank=True)

    def __str__(self):
        return self.user.username
