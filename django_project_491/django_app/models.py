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
    language = models.CharField(max_length=200)  # programmingLanguage field like python
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

    def save(self, *args, **kwargs):
        # Call the original save method
        super().save(*args, **kwargs)
        # Check and promote user after saving the comment
        self.author.check_and_promote()

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

    def save(self, *args, **kwargs):
        # Call the original save method
        super().save(*args, **kwargs)
        # Check and promote user after saving the question
        self.author.check_and_promote()


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
    name = models.CharField(max_length=30, blank=True, null=True)
    surname = models.CharField(max_length=30, blank=True, null=True)

    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True) 
    bio = models.TextField(blank=True, null=True) 
    interested_topics = models.JSONField(blank=True, default=list)  # Example: ['NLP', 'Computer Vision']
    known_languages = models.JSONField(blank=True, default=list)  # Example: ['Python', 'Java']

    # Relationships
    bookmarks = models.ManyToManyField('Question', related_name='bookmarked_by', blank=True)

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

    def get_question_details(self):
        return [{
            'id': question._id,
            'title': question.title,
            'language': question.language,
            'tags': question.tags,
            'details': question.details,
            'code_snippet': question.code_snippet,
            'upvotes': question.upvotes,
            'creationDate': question.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'answered': question.answered,
            'author': question.author.username,
            'reported_by': [user.username for user in question.reported_by.all()],
            'upvoted_by': [vote.user.username for vote in question.votes.filter(vote_type=VoteType.UPVOTE.value)],
            'downvoted_by': [vote.user.username for vote in question.votes.filter(vote_type=VoteType.DOWNVOTE.value)],            
        } for question in self.questions.all()]

    def get_comment_details(self):
        return [{
            'comment_id': comment._id,
            'details': comment.details,
            'user': comment.author.username,
            'upvotes': comment.upvotes,
            'code_snippet': comment.code_snippet,
            'language': comment.language,  
            'creationDate': comment.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'upvoted_by': [vote.user.username for vote in comment.votes.filter(vote_type=VoteType.UPVOTE.value)],
            'downvoted_by': [vote.user.username for vote in comment.votes.filter(vote_type=VoteType.DOWNVOTE.value)],
            'answer_of_the_question': comment.answer_of_the_question,
        } for comment in self.authored_comments.all()]

    def get_bookmark_details(self):
        return [{
            'id': bookmark._id,
            'title': bookmark.title,
            'language': bookmark.language,
            'tags': bookmark.tags,
            'details': bookmark.details,
            'code_snippet': bookmark.code_snippet,
            'upvotes': bookmark.upvotes,
            'creationDate': bookmark.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        } for bookmark in self.bookmarks.all()]

    def calculate_total_points(self):
        question_points = self.questions.count() * 2
        comment_points = sum(5 if comment.answer_of_the_question else 1 for comment in self.authored_comments.all())
        return question_points + comment_points

    def check_and_promote(self):
        total_points = self.calculate_total_points()
        promotion_threshold = 100  # A threshold to promote a user to a super user, or demote super user to a user

        if total_points >= promotion_threshold and self.userType != UserType.SUPER_USER:
            self.userType = UserType.SUPER_USER
            self.save()
        
        elif total_points < promotion_threshold and self.userType == UserType.SUPER_USER:
            self.userType = UserType.USER
            self.save()
        
        return self.userType