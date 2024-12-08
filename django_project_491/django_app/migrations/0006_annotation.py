# Generated by Django 5.1.2 on 2024-11-21 23:18

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('django_app', '0005_comment_language'),
    ]

    operations = [
        migrations.CreateModel(
            name='Annotation',
            fields=[
                ('_id', models.AutoField(primary_key=True, serialize=False)),
                ('text', models.TextField()),
                ('language_qid', models.IntegerField(default=0)),
                ('annotation_starting_point', models.IntegerField(default=0)),
                ('annotation_ending_point', models.IntegerField(default=0)),
                ('annotation_date', models.DateTimeField(auto_now_add=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='annotations', to=settings.AUTH_USER_MODEL)),
                ('parent_annotation', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='child_annotations', to='django_app.annotation')),
            ],
        ),
    ]
