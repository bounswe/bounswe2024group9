# Generated by Django 4.2.13 on 2024-05-14 21:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database_search', '0010_route_node_names'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='liked_routes',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='user',
            name='saved_routes',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
