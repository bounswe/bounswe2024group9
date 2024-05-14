from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# from django.utils.translation import ugettext_lazy as _ For global interface it is mentioned but for now it is not necessary
# Django version bigger than 3.1 for JSONField


class Node(models.Model):
    name = models.CharField(max_length=255)
    node_id = models.AutoField(primary_key=True)
    photo = models.URLField()

    # TODO: Resctrict the latitude and longitude values to be in the range of Istanbul
    latitude = models.DecimalField(max_digits=9, decimal_places=6, default=40.984396)     # max_digits=9 and decimal_places=6 means that your latitude and longitude values will have 6 digits after the decimal point and a total of 9 digits. 
    longitude = models.DecimalField(max_digits=9, decimal_places=6, default=29.025434)     # This is a common choice for storing coordinates because it allows for precision up to 0.000001 degrees, which is approximately up to 11.1 centimeters at the equator.
    # Default latitude and longitude is set to the center of Kadikoy/Istanbul

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
    node_ids = models.TextField() # IMPORTANT! This field is string but keeping an array of integers. EX: "1, 2, 3". IT MUST BE CONVERTED TO AN ARRAY BEFORE USING IT.
    node_names = models.TextField() # IMPORTANT! This field is string but keeping an array of strings. EX: "Node 1, Node 2, Node 3". IT MUST BE CONVERTED TO AN ARRAY BEFORE USING IT. 
    duration = models.JSONField(default=list, blank=True)  # Time spent in the location. Type: minutes
    duration_between = models.JSONField(default=list, blank=True)  #Time spent between locations like 15 min between node 1 and 2
    mapView = models.URLField()
    user = models.CharField(max_length=255, default = None)

import logging

logger = logging.getLogger(__name__)

# For now it is controlling the username but if the email is controlled aalso it should be specified
class CustomUserManager(BaseUserManager): 
    """
    Custom user model manager where username is the unique identifiers
    for authentication instead of emails.
    """
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username must be set')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(username, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=255, unique=True) # Length should be changed
    password = models.CharField(max_length=128, verbose_name='password')
    e_mail = models.EmailField(max_length=255, unique=True) # Length should be changed
    profile_picture = models.ImageField(upload_to='profile_pics', null=True, blank=True)

    # Reverse relationship from Route to User needs to be implemented in the future
    # routes = models.ManyToManyField('Route', related_name='users', blank=True)

    # For followers and following, you would typically use a many-to-many field. However, this requires a through table or self-referential M2M field
    # It needs to be implemented in the future
    # followers = models.ManyToManyField('self', symmetrical=False, related_name='followed_by', blank=True)
    following = models.ManyToManyField('self', symmetrical=False, related_name='following_users', blank=True)

    is_active = models.BooleanField(default=True) # This field is required for Django's AbstractBaseUser. It is used to determine whether the user is active or not. It is like instead of deleting the user, it is better to deactivate it.
    is_staff = models.BooleanField(default=False) # This field is required for Django's AbstractBaseUser. It is used to determine whether the user is a staff member or not. It is used to determine whether the user is allowed to access the admin site or not.
    is_superuser = models.BooleanField(default=False) # This field is required for Django's AbstractBaseUser. It is used to determine whether the user is a superuser or not. It is used to determine whether the user is allowed to access the admin site or not.
    
    objects = CustomUserManager()

    liked_routes = models.JSONField(default=list, blank=True) 
    saved_routes = models.JSONField(default=list, blank=True) 

    USERNAME_FIELD = 'username' # This is the field that is used for authentication.
    REQUIRED_FIELDS = [] # This is golding the field which is required to register the user. Since username and user_id are required fields, we don't need to specify any other fields.

    def __str__(self):
        return self.username

    def get_following_routes(self):
        following_users = self.following.all()
        routes = Route.objects.filter(user__in=following_users)
        return routes

# When a field is changed in the model, the database must be updated.
# To do this, run the following commands:
# python manage.py makemigrations
# python manage.py migrate
# These commands will update the database schema to match the model.