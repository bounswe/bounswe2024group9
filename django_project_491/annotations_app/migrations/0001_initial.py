# Generated by Django 5.1.2 on 2024-12-12 14:51

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
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
                ('author_id', models.IntegerField(default=0)),
                ('parent_annotation', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='child_annotations', to='annotations_app.annotation')),
            ],
        ),
    ]