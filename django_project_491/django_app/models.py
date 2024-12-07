from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from enum import Enum
from typing import List
from .Utils.utils import *


# After editing the models do not forget to run the following commands:
# python manage.py makemigrations
# python manage.py migrate

def check_status(status):
    status_list = [
    "In Queue",
    "Processing",
    "Accepted",
    "Wrong Answer",
    "Time Limit Exceeded",
    "Compilation Error",
    "Runtime Error (SIGSEGV)",
    "Runtime Error (SIGXFSZ)",
    "Runtime Error (SIGFPE)",
    "Runtime Error (SIGABRT)",
    "Runtime Error (NZEC)",
    "Runtime Error (Other)",
    "Internal Error",
    "Exec Format Error"
    ]

    return status_list[status["id"]-1]

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

    def run_snippet(self):
        result = run_code(self.code_snippet, self.language_id)
        if result['stderr']:
            return [result['stderr']]

        elif result['status']['id'] != 3 and result['status']['id'] != 4:
            return [check_status(result['status'])]

        elif result['stdout'] is None:
            return ["NO OUTPUT for STDOUT"]

        else:
            return result['stdout'].split('\n')

    def save(self, *args, **kwargs):
        # Call the original save method
        super().save(*args, **kwargs)
        # Check and promote user after saving the comment
        self.author.check_and_promote()

class Question(models.Model):
    _id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    language = models.CharField(max_length=200)  # programmingLanguage field like python
    language_id = models.IntegerField(default=-1)   # Language ID for Python like 71
    tags = models.JSONField(blank=True, default=list)  # Example: ['tag1', 'tag2']
    details = models.TextField()
    code_snippet = models.TextField()
    upvotes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    answered = models.BooleanField(default=False)
    reported_by = models.ManyToManyField('User', related_name='reported_questions', blank=True)

    author = models.ForeignKey('User', on_delete=models.CASCADE, related_name='questions')

    def __str__(self):
        return f"{self.title} ({self.language})"
    
    def run_snippet(self): # TODO
        result = run_code(self.code_snippet, self.language_id)
        if result['stderr']:
            return [result['stderr']]

        elif result['status']['id'] != 3 and result['status']['id'] != 4:
            return [check_status(result['status'])]

        elif result['stdout'] is None:
            return ["NO OUTPUT for STDOUT"]

        else:
            return result['stdout'].split('\n')

    def mark_as_answered(self, comment_id): # TODO
        self.answered = True
        self.save()

    def save(self, *args, **kwargs):
        # Call the original save method
        super().save(*args, **kwargs)
        # Check and promote user after saving the question
        self.author.check_and_promote()

    def get_topic_info(self):
            if self.topic:
                try:
                    topic_obj = Topic.objects.get(name__iexact=self.topic)
                    return {
                        'label': topic_obj.name,
                        'url': topic_obj.related_url,
                    }
                except Topic.DoesNotExist:
                    return {'label': self.topic, 'url': None}
            return {'label': None, 'url': None}


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
        user_votes = Question_Vote.objects.filter(user_id=self.user_id).values('question_id', 'vote_type')
        user_votes_dict = {vote['question_id']: vote['vote_type'] for vote in user_votes}
        return [{
            'id': q.pk,
            'title': q.title,
            'description': q.details,
            'user_id': q.author.pk,
            'username': q.author.username,
            'upvotes': q.upvotes,
            'comments_count': q.comments.count(),
            'programmingLanguage': q.language,
            'codeSnippet': q.code_snippet,
            'tags': q.tags,
            'answered': q.answered,
            'is_upvoted': user_votes_dict.get(q.pk) == VoteType.UPVOTE.value,
            'is_downvoted': user_votes_dict.get(q.pk) == VoteType.DOWNVOTE.value,
            'created_at' : q.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        } for q in self.questions.all()]

    def get_comment_details(self):
        return [{
            'question_id': comment.question.pk,
            'comment_id': comment._id,
            'details': comment.details,
            'user': comment.author.username,
            'upvotes': comment.upvotes,
            'code_snippet': comment.code_snippet,
            'language': comment.language_id,
            'creationDate': comment.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'upvoted_by': [vote.user.username for vote in comment.votes.filter(vote_type=VoteType.UPVOTE.value)],
            'downvoted_by': [vote.user.username for vote in comment.votes.filter(vote_type=VoteType.DOWNVOTE.value)],
            'answer_of_the_question': comment.answer_of_the_question
        } for comment in self.authored_comments.all()]

    def get_bookmark_details(self):
        user_votes = Question_Vote.objects.filter(user_id=self.user_id).values('question_id', 'vote_type')
        user_votes_dict = {vote['question_id']: vote['vote_type'] for vote in user_votes}
        return [{
            'id': bookmark.pk,
            'title': bookmark.title,
            'description': bookmark.details,
            'user_id': bookmark.author.pk,
            'username': bookmark.author.username,
            'upvotes': bookmark.upvotes,
            'comments_count': bookmark.comments.count(),
            'programmingLanguage': bookmark.language,
            'codeSnippet': bookmark.code_snippet,
            'tags': bookmark.tags,
            'answered': bookmark.answered,
            'is_upvoted': user_votes_dict.get(bookmark.pk) == VoteType.UPVOTE.value,
            'is_downvoted': user_votes_dict.get(bookmark.pk) == VoteType.DOWNVOTE.value,
            'created_at' : bookmark.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        } for bookmark in self.bookmarks.all()]

    # TODO: SHOULD BE CHANGED ACCORDING TO THE NEW ANNOTATION MODEL
    def get_annotation_details(self):
        return [{
            'annotation_id': annotation._id,
            'text': annotation.text,
            'language_qid': annotation.language_qid,
            'annotation_starting_point': annotation.annotation_starting_point,
            'annotation_ending_point': annotation.annotation_ending_point,
            'annotation_date': annotation.annotation_date.strftime('%Y-%m-%d %H:%M:%S'),
            'author': annotation.author.username,
        } for annotation in self.annotations.all()]

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
    

# TODO: Language name should be added to the Annotation model
class Annotation(models.Model):
    _id = models.AutoField(primary_key=True)
    text = models.TextField()
    language_qid = models.IntegerField(default=0)  # QID of the question example : Q24582
    annotation_starting_point = models.IntegerField(default=0) 
    annotation_ending_point = models.IntegerField(default=0)
    annotation_date = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey('User', on_delete=models.CASCADE, related_name='annotations')
    parent_annotation = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='child_annotations',
        null=True,
        blank=True
    )

    def __str__(self):
        return self.text

    def __repr__(self):
        return self.text

    def __unicode__(self):
        return self.text
        
        
class Topic(models.Model):
    name = models.CharField(max_length=100, unique=True)
    related_url = models.URLField()

    def __str__(self):
        return self.name

    @staticmethod
    def get_all_topics():
        return Topic.objects.all()

    @staticmethod
    def get_url_for_topic(topic_name):
        try:
            topic = Topic.objects.get(name__iexact=topic_name)
            return topic.related_url
        except Topic.DoesNotExist:
            return None
