from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from enum import Enum

# After editing the models do not forget to run the following commands:
# python manage.py makemigrations
# python manage.py migrate



class UserType(Enum):
    ADMIN = "admin"
    USER = "user"
    SUPER_USER = "super_user"

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
    userType = UserType.USER

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
    # password = models.CharField(max_length=100) AbstractBaseUser already has password field
    userType = models.CharField(max_length=20, choices=[(tag, tag.value) for tag in UserType], default=UserType.USER)
    
    # Relationships
    questions = models.ManyToManyField('Question', related_name='user_questions', blank=True)
    comments = models.ManyToManyField('Comment', related_name='user_comments', blank=True)
    bookmarks = models.JSONField(blank=True, default=list) # Example : ['link1', 'link2']

    objects = UserManager() # Required for the custom user model

    USERNAME_FIELD = 'username' # Control if the user is signin in with username. Needless line since it is default. I put it to make things more educational
    REQUIRED_FIELDS = ['email'] # Do not accept user without email

    def __str__(self): # See username when the object is printed
        return self.username
    
    def has_perm(self, perm, obj=None): # 1/3 added because of my custom userType 
        if self.userType == UserType.ADMIN:
            return True 
        return super().has_perm(perm, obj)

    def has_module_perms(self, app_label): # 2/3 added because of my custom userType
        if self.userType == UserType.ADMIN:
            return True
        return super().has_module_perms(app_label)

    @property
    def is_staff(self): # 3/3 added because of my custom userType
        return self.userType == UserType.ADMIN


    # ADDING BOOKMARK FUNCTIONALITY
    # ADDING QUESTION FUNCTIONALITY
    # ADDING COMMENT FUNCTIONALITY