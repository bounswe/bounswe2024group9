from ..models import UserType, User, Question
from django.contrib.auth import login, authenticate, get_user_model
from django.http import HttpRequest, HttpResponse, JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def get_user_profile_by_username(request, username : str) -> JsonResponse:
    if not username:
        return JsonResponse({'error': 'Username parameter is required'}, status=400)
    
    user : User = get_user_model().objects.get(username=username)
    
    user_data = {
        'username': user.username,
        'email': user.email,
        'questions': [question._id for question in user.questions.all()],
        'comments': [comment._id for comment in user.comments.all()],
        'bookmarks': user.bookmarks,
    }
    
    return JsonResponse({'user': user_data}, status=200)

#TODO find what can be changed in the user profile.
@csrf_exempt
def edit_user_profile(request, will_be_edited_user_id : int) -> JsonResponse:
    wants_to_edit_user_id = request.user.id

    if not will_be_edited_user_id:
        return JsonResponse({'error': 'User ID parameter is required'}, status=400)
    
    if not wants_to_edit_user_id:
        return JsonResponse({'error': 'User ID parameter is required'}, status=403)

    will_be_edited_user : User = get_user_model().objects.get(pk=will_be_edited_user_id)
    wants_to_edit_user : User = get_user_model().objects.get(pk=wants_to_edit_user_id)

    if wants_to_edit_user.userType != UserType.ADMIN and wants_to_edit_user_id != will_be_edited_user_id:
        return JsonResponse({'error': 'Only admins and owner of the profiles can edit user profiles'}, status=403)


    data = json.loads(request.body)
    
    #TODO find what can be changed in the user profile. Maybe adding profile picture, bio, etc.
    if 'username' in data:
        will_be_edited_user.username = data['username']
    if 'email' in data:
        will_be_edited_user.email = data['email']
    if 'bio' in data:
        will_be_edited_user.bio = data['bio']
    if 'profile_pic' in data:
        will_be_edited_user.profile_pic = data['profile_pic']

    
    will_be_edited_user.save()
    
    return JsonResponse({'success': 'User profile updated successfully'}, status=200)

@csrf_exempt
def delete_user_profile(request, will_be_deleted_user_id : int) -> JsonResponse:
    wants_to_delete_user_id = request.user.id

    if not will_be_deleted_user_id:
        return JsonResponse({'error': 'User ID parameter is required'}, status=400)
    
    if not wants_to_delete_user_id:
        return JsonResponse({'error': 'User ID parameter is required'}, status=403)
    

    wants_to_delete_user: User = get_user_model().objects.get(pk=wants_to_delete_user_id)
    
    if wants_to_delete_user.userType != UserType.ADMIN and wants_to_delete_user_id != will_be_deleted_user_id:
        return JsonResponse({'error': 'Only admins and owner of the profiles can delete user profiles'}, status=403)
    

    will_be_deleted_user = get_user_model().objects.get(pk=will_be_deleted_user_id)
    
    will_be_deleted_user.delete()
    
    return JsonResponse({'success': 'User profile deleted successfully'}, status=200)


@csrf_exempt
def signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password1 = data.get('password1')
            password2 = data.get('password2')
        except (KeyError, json.JSONDecodeError) as e:
            return JsonResponse({'error': f'Malformed data: {str(e)}'}, status=400)

        if password1 != password2:
            return JsonResponse({'error': 'Passwords do not match'}, status=400)

        User = get_user_model()

        # Check if the username or email already exists
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username is already taken'}, status=400)
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email is already registered'}, status=400)

        user = User(username=username, email=email)
        user.set_password(password1)  # It will hash the password
        user.save()

        return JsonResponse({'success': 'User created successfully', 'user_id': user.pk, 'username': user.username}, status=201)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def login_user(request : HttpRequest) -> HttpResponse:
    if request.method == 'POST':
        try:
            # Parse the incoming JSON request body
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
        except (KeyError, json.JSONDecodeError) as e:
            # Handle malformed data
            return JsonResponse({'error': 'Malformed data, error: ' + str(e)}, status=400)

        # Authenticate the user
        user = authenticate(username=username, password=password)
        if user is not None:
            # Authentication successful, log in the user
            login(request, user)
            return JsonResponse({'status': 'success', 'user_id': user.pk}, status=200)
        else:
            # Authentication failed, log the failed attempt and return an error
            print("Failed login attempt for username:", username)
            return JsonResponse({'error': 'Invalid username or password'}, status=400)
    else:
       # Method not allowed if not POST
        return HttpResponse(status=405)


@csrf_exempt
def add_interested_languages_for_a_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_id = data.get('user_id')
        user : User = get_user_model().objects.get(pk=user_id)
    
        user.interested_topics = data.get('interested_topics', [])
        user.known_languages = data.get('known_languages', [])
        user.save()
        return JsonResponse({'success': 'Interested languages updated successfully'}, status=200)
    return JsonResponse({'error': 'Invalid request method'}, status=405)


    
@csrf_exempt
def question_of_the_day(request):
    # Retrieve 5 random questions
    question = Question.objects.order_by('?')[0]

    question_data = {
        'id': question._id,
        'title': question.title,
        'description': question.details,
        'user_id': question.author.pk,
        'likes': question.upvotes,
        'comments_count': question.comments.count(),
        'programmingLanguage': question.language,
        'codeSnippet': question.code_snippet,
        'tags': question.tags,
        'answered': question.answered,
        'topic': question.topic
    }

    return JsonResponse({'question': question_data}, safe=False)
@csrf_exempt
def list_questions_according_to_the_user(request, user_id : int):
    questions = []

    user : User = get_user_model().objects.get(pk=user_id)
    known_languages = user.known_languages
    for language in known_languages:
        questions += list(Question.objects.filter(language=language))
    
    interested_topics = user.interested_topics
    for topic in interested_topics:
        questions += list(Question.objects.filter(tags__contains=topic))
    
    if len(questions) == 0:
        questions = list(Question.objects.all())
    
    questions = questions[:10]

    questions_data = [{
        'id': question._id,
        'title': question.title,
        'description': question.details,
        'user_id': question.author.pk,
        'likes': question.upvotes,
        'comments_count': question.comments.count(),
        'programmingLanguage': question.language,
        'codeSnippet': question.code_snippet,
        'tags': question.tags,
        'answered': question.answered,
        'topic': question.topic
    } for question in questions]

    return JsonResponse({'questions': questions_data}, safe=False)

@csrf_exempt
def get_user_preferred_languages(request):
    data = json.loads(request.body)
    user_id = data.get('user_id')
    user : User = get_user_model().objects.get(pk=user_id)
    return JsonResponse({'known_languages': user.known_languages, 'interested_topics': user.interested_topics}, status=200)