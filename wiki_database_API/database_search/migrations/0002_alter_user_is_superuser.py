# Generated by Django 5.0.4 on 2024-04-20 11:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database_search', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='is_superuser',
            field=models.BooleanField(default=False),
        ),
    ]