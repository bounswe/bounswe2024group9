# Generated by Django 5.1.2 on 2024-10-18 08:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('django_app', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='userType',
            field=models.CharField(choices=[('admin', 'admin'), ('user', 'user'), ('super_user', 'super_user')], default='user', max_length=20),
        ),
    ]
