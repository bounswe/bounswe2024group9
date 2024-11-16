from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from enum import Enum
from typing import List
from .Utils.utils import *


# After editing the models do not forget to run the following commands:
# python manage.py makemigrations
# python manage.py migrate

class UserType(Enum):
    ADMIN = "admin"
    USER = "user"
    SUPER_USER = "super_user"


class VoteType(Enum):
    UPVOTE = "upvote"
    DOWNVOTE = "downvote"


class Comment_Vote(models.Model):
    _id = models.AutoField(primary_key=True)
    vote_type = models.CharField(max_length=20, choices=[(tag.value, tag.value) for tag in VoteType])
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='comment_votes')
    comment = models.ForeignKey('Comment', on_delete=models.CASCADE, related_name='votes')

    def __str__(self):
        return f"{self.user.username} {self.vote_type}ed {self.comment.details}"
    
class Question_Vote(models.Model):
    _id = models.AutoField(primary_key=True)
    vote_type = models.CharField(max_length=20, choices=[(tag.value, tag.value) for tag in VoteType])
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='question_votes')
    question = models.ForeignKey('Question', on_delete=models.CASCADE, related_name='votes')


    def __str__(self):
        return f"{self.user.username} {self.vote_type}ed {self.question.title}"

class Comment(models.Model):
    _id = models.AutoField(primary_key=True)
    details = models.TextField()
    code_snippet = models.TextField()
    language_id = models.IntegerField(default=71)  # Language ID for Python
    upvotes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    answer_of_the_question = models.BooleanField(default=False) # This is a flag to indicate if the comment is an answer to the question that it is associated with
    question = models.ForeignKey('Question', on_delete=models.CASCADE, related_name='comments')  # New field linking a comment to a question

    # Link each comment to a user (author)
    author = models.ForeignKey('User', on_delete=models.CASCADE, related_name='authored_comments')  # Updated related_name

    def run_snippet(self): # TODO
        result = run_code(self.code_snippet, self.language_id)
        outs = result['stdout'].split('\n')
        return outs

    # def upvote(self):
    #     self.upvotes += 1
    #     self.save()

    # def downvote(self):
    #     self.upvotes -= 1
    #     self.save()

class Question(models.Model):
    _id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    language = models.CharField(max_length=200)  # programmingLanguage field like python
    language_id = models.IntegerField(default=71)  # Language ID for Python like 71
    tags = models.JSONField(blank=True, default=list)  # Example: ['tag1', 'tag2']
    details = models.TextField()
    code_snippet = models.TextField()

    upvotes = models.IntegerField(default=0)
    created_at  = models.DateTimeField(auto_now_add=True)
    topic = models.CharField(max_length=100, blank=True)
    answered = models.BooleanField(default=False)
    reported_by = models.ManyToManyField('User', related_name='reported_questions', blank=True)

    author = models.ForeignKey('User', on_delete=models.CASCADE, related_name='questions')

    def run_snippet(self): # TODO
        result = run_code(self.code_snippet, self.language_id)
        outs = result['stdout'].split('\n')
        return outs

    def mark_as_answered(self): # TODO
        self.answered = True
        self.save()

    # def upvote(self):
    #     self.upvotes += 1
    #     self.save()

    # def downvote(self):
    #     self.upvotes -= 1
    #     self.save()


class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, userType: UserType = UserType.USER):
        if not email:
            raise ValueError("Users must have an email address")
        if not username:
            raise ValueError("Users must have a username")
        if not password:
            raise ValueError("Users must have a password")

        user: User = self.model(
            email=self.normalize_email(email),
            username=username,
            userType=userType
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username: str, email: str, password: str = None):
        return self.create_user(
            username=username,
            email=email,
            password=password,
            userType=UserType.ADMIN
        )


class User(AbstractBaseUser):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=30, unique=True)
    email = models.EmailField(max_length=255, unique=True)
    userType = models.CharField(max_length=20, choices=[(tag.value, tag.value) for tag in UserType],
                                default=UserType.USER.value)
    
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True) # May be removed later
    bio = models.TextField(blank=True, null=True) # May be removed later
    interested_topics = models.JSONField(blank=True, default=list)  # Example: ['NLP', 'Computer Vision']
    known_languages = models.JSONField(blank=True, default=list)  # Example: ['Python', 'Java']

    # Relationships
    # bookmarks = models.JSONField(blank=True, default=list)  # Example: ['link1', 'link2']

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):  # 1/3 added because of my custom userType
        if self.userType == UserType.ADMIN:
            return True
        return False

    def has_module_perms(self, app_label):  # 2/3 added because of my custom userType
        if self.userType == UserType.ADMIN:
            return True
        return False

    @property
    def is_staff(self):  # 3/3 added because of my custom userType
        return self.userType == UserType.ADMIN

    # ADDING BOOKMARK FUNCTIONALITY
    def add_bookmark(self, link: str): # TODO
        """Adds a bookmark to the user."""
        if link not in self.bookmarks:
            self.bookmarks.append(link)
            self.save()

    def remove_bookmark(self, link: str): # TODO
        """Removes a bookmark from the user."""
        if link in self.bookmarks:
            self.bookmarks.remove(link)
            self.save()

    def get_bookmarks(self) -> list: # TODO
        """Returns the user's bookmarks."""
        return self.bookmarks
