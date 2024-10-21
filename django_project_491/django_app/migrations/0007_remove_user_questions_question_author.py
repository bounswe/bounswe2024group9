# Generated by Django 5.1.2 on 2024-10-20 22:41

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('django_app', '0006_question_answered_question_topic'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='questions',
        ),
        migrations.AddField(
            model_name='question',
            name='author',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='questions', to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]