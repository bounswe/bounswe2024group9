# Generated by Django 4.2.11 on 2024-04-28 07:13

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('database_search', '0002_auto_20240428_0952'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='name',
        ),
    ]