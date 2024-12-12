# backup_data.py
from django_app.models import User, Question, Comment
import json
from django.core.files.base import File
import base64

def backup_data():
    # Backup Users first
    users_data = []
    for user in User.objects.all():
        user_dict = {
            'user_id': user.user_id,
            'username': user.username,
            'email': user.email,
            'userType': user.userType,
            'name': user.name,
            'surname': user.surname,
            'bio': user.bio,
            'interested_topics': user.interested_topics,
            'known_languages': user.known_languages,
            'bookmarks': list(user.bookmarks.values_list('_id', flat=True)),
        }
        # Handle profile picture if exists

        users_data.append(user_dict)

    # Backup Questions
    questions_data = []
    for question in Question.objects.all():
        question_dict = {
            '_id': question._id,
            'title': question.title,
            'language': question.language,
            'language_id': question.language_id,
            'tags': question.tags,
            'details': question.details,
            'code_snippet': question.code_snippet,
            'upvotes': question.upvotes,
            'created_at': question.created_at.isoformat(),
            'answered': question.answered,
            'author_id': question.author.user_id,
            'reported_by': list(question.reported_by.values_list('user_id', flat=True))
        }
        questions_data.append(question_dict)

    # Backup Comments
    comments_data = []
    for comment in Comment.objects.all():
        comment_dict = {
            '_id': comment._id,
            'details': comment.details,
            'code_snippet': comment.code_snippet,
            'language': comment.language,
            'language_id': comment.language_id,
            'upvotes': comment.upvotes,
            'created_at': comment.created_at.isoformat(),
            'answer_of_the_question': comment.answer_of_the_question,
            'question_id': comment.question._id,
            'author_id': comment.author.user_id
        }
        comments_data.append(comment_dict)

    # Save all data to files
    with open('users_backup.json', 'w') as f:
        json.dump(users_data, f, indent=4)
    
    with open('questions_backup.json', 'w') as f:
        json.dump(questions_data, f, indent=4)
    
    with open('comments_backup.json', 'w') as f:
        json.dump(comments_data, f, indent=4)

def restore_data():
    from django.core.files.base import ContentFile
    import os
    
    # Load Users
    with open('users_backup.json', 'r') as f:
        users_data = json.load(f)
    
    users_map = {}  # To store old_id -> new_user mapping
    for user_dict in users_data:
        user = User.objects.create(
            username=user_dict['username'],
            email=user_dict['email'],
            userType=user_dict['userType'],
            name=user_dict['name'],
            surname=user_dict['surname'],
            bio=user_dict['bio'],
            interested_topics=user_dict['interested_topics'],
            known_languages=user_dict['known_languages']
        )
        if 'profile_pic' in user_dict:
            image_data = base64.b64decode(user_dict['profile_pic']['content'])
            user.profile_pic.save(
                user_dict['profile_pic']['name'],
                ContentFile(image_data)
            )
        users_map[user_dict['user_id']] = user
    users = User.objects.all()
    print(users)