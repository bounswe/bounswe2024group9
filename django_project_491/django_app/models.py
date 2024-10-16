from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


class Comment(models.Model):
    _id = models.AutoField(primary_key=True)
    details = models.TextField()
    code_snippet = models.TextField()
    upvotes = models.IntegerField(default=0)

    def run_snippet(self):
        raise NotImplementedError("API SHOULD BE CALLED FROM HERE")
    
    def upvote(self):
        self.upvotes += 1
        self.save()

    def downvote(self):
        self.upvotes -= 1
        self.save()


class Question(models.Model):
    _id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    details = models.TextField()
    code_snippet = models.TextField()
    comments = models.ManyToManyField('Comment', related_name='question_comments', blank=True)
    upvotes = models.IntegerField(default=0)


    def run_snippet(self):
        raise NotImplementedError("API SHOULD BE CALLED FROM HERE")

    def add_comment(self, comment):
        self.comments.add(comment)
        self.save()

    def upvote(self):
        self.upvotes += 1
        self.save()

    def downvote(self):
        self.upvotes -= 1
        self.save()


class User(AbstractBaseUser):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=30, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    password = models.CharField(max_length=100)

    # Relationships
    questions = models.ManyToManyField('Question', related_name='user_questions', blank=True)
    comments = models.ManyToManyField('Comment', related_name='user_comments', blank=True)
    bookmarks = models.TextField(blank=True, default="[]")  # Example : ['link1', 'link2']
