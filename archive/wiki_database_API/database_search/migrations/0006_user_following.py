# Generated by Django 4.2.13 on 2024-05-14 20:06

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database_search', '0005_route_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='following',
            field=models.ManyToManyField(blank=True, related_name='following_users', to=settings.AUTH_USER_MODEL),
        ),
    ]
