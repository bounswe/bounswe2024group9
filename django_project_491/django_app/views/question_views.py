
from ..models import Question, Comment, UserType, User, VoteType, Question_Vote, Topic
from django.db.models import Count, Q, F
from django.http import HttpRequest, HttpResponse, JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from django.core.cache import cache
from datetime import datetime
from django.utils import timezone
from ..Utils.utils import *
from ..Utils.forms import *
from ..ai_service.control_question_quality import QuestionQualityController
from typing import List
from concurrent.futures import ThreadPoolExecutor
from django.core.cache import cache
from functools import wraps

from .utilization_views import wiki_result
from .annotation_views import get_annotations_by_language
from django.http import HttpRequest

def invalidate_user_cache(cache_key_prefix='feed_user'):
    """
    A decorator to invalidate the cache for a given user_id.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            user_id = request.headers.get('User-ID')

            if user_id:
                # Invalidate the user's cache
                cache_key = f"{cache_key_prefix}_{user_id}"
                cache.delete(cache_key)

            # Call the original function
            response = func(request, *args, **kwargs)

            return response

        return wrapper
    return decorator

def get_question_details(request: HttpRequest, question_id: int) -> HttpResponse:
    """
    Retrieve the details of a specific question by its ID.

    Args:
        request (HttpRequest): The HTTP request object.
        question_id (int): The ID of the question to retrieve.

    Returns:
        HttpResponse: A JSON response containing the question details if found,
                      or an error message if the question does not exist.

    The returned JSON response contains the following fields:
        - id (int): The ID of the question.
        - title (str): The title of the question.
        - language (str): The programming language related to the question.
        - tags (str): The tags associated with the question.
        - details (str): The detailed description of the question.
        - code_snippet (str): The code snippet provided in the question.
        - upvote_count (int): The number of upvotes the question has received.
        - creationDate (str): The creation date of the question in 'YYYY-MM-DD HH:MM:SS' format.
        - author (str): The username of the author of the question.
        - comments_count (int): The number of comments on the question.
        - answered (bool): Whether the question has been answered.
        - topic (str): The topic of the question.
        - reported_by (list): A list of usernames who have reported the question.
        - upvoted_by (list): A list of usernames who have upvoted the question.
        - downvoted_by (list): A list of usernames who have downvoted the question.

    Raises:
        Question.DoesNotExist: If the question with the given ID does not exist.
    """
    try:
        question : Question = Question.objects.prefetch_related('comments', 'reported_by', 'votes__user').get(_id=question_id)

        question_data = {
            'id': question._id,
            'title': question.title,
            'language': question.language,
            'language_id': question.language_id,
            'tags': question.tags,
            'details': question.details,
            'code_snippet': question.code_snippet,
            'upvote_count': question.upvotes,
            'creationDate': question.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'author': question.author.username,
            'comments_count': question.comments.count(),
            'answered': question.answered,
            'reported_by': [user.username for user in question.reported_by.all()],
            'upvoted_by': [vote.user.username for vote in question.votes.filter(vote_type=VoteType.UPVOTE.value)],
            'downvoted_by': [vote.user.username for vote in question.votes.filter(vote_type=VoteType.DOWNVOTE.value)]
        }            

        return JsonResponse({'question': question_data}, status=200)

    except Question.DoesNotExist:
        return JsonResponse({'error': 'Question not found'}, status=404)


@csrf_exempt
def get_question_comments(request, question_id):
    """
    Retrieve comments for a specific question.
    Args:
        request (HttpRequest): The HTTP request object.
        question_id (int): The ID of the question for which comments are to be retrieved.
    Returns:
        JsonResponse: A JSON response containing a list of comments with their details, or an error message if the question is not found.
    The returned JSON structure for comments includes:
        - comment_id (int): The ID of the comment.
        - details (str): The details of the comment.
        - user (str): The username of the comment's author.
        - upvotes (int): The number of upvotes the comment has received.
        - code_snippet (str): The code snippet included in the comment, if any.
        - language (str): The programming language of the code snippet.
        - creationDate (str): The creation date of the comment in 'YYYY-MM-DD HH:MM:SS' format.
        - upvoted_by (list): A list of usernames who upvoted the comment.
        - downvoted_by (list): A list of usernames who downvoted the comment.
        - answer_of_the_question (bool): Whether the comment is marked as the answer to the question.
    """
    try:
        question = Question.objects.get(_id=question_id)
        comments: List[Comment] = question.comments.all()

        comments_data = [{
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
        } for comment in comments]

        return JsonResponse({'comments': comments_data}, status=200)

    except Question.DoesNotExist:
        return JsonResponse({'error': 'Question not found'}, status=404)

@csrf_exempt  
@invalidate_user_cache()
def create_question(request: HttpRequest) -> HttpResponse:
    """
    Handle the creation of a new question.
    Args:
        request (HttpRequest): The HTTP request object containing the question data.
    Returns:
        HttpResponse: A JSON response indicating the success or failure of the question creation.
    The function expects a POST request with a JSON body containing the following fields:
        - title (str): The title of the question.
        - language (str): The programming language related to the question.
        - details (str): Detailed description of the question.
        - code_snippet (str, optional): A code snippet related to the question.
        - tags (list, optional): A list of tags associated with the question.
    Possible HTTP status codes:
        - 201: Question created successfully.
        - 400: Malformed data or invalid language.
        - 405: Invalid request method (not POST).
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            title = data.get('title')
            language = data.get('language')
            details = data.get('details')
            user_id = request.headers.get('User-ID', None)
            code_snippet = data.get('code_snippet', '')  # There may not be a code snippet
            tags = data.get('tags', [])  # There may not be any tags

            user = User.objects.get(pk=user_id)
            Lang2ID = get_languages()
            language_id = Lang2ID.get(language, None)

            user = User.objects.get(pk=request.headers.get('User-ID', None))


            if language_id is None:
                print("Invalid language")
                return JsonResponse({'error': 'Invalid language'}, status=400)
            
            try:
                question_controller = QuestionQualityController()
                is_valid_question = question_controller.is_valid_question(data)
                if(not is_valid_question):
                    print("Question is not valid")
                    return JsonResponse({'error': 'Question is not approved by LLM'}, status=400)
            except Exception as e:
                print(e)

            question = Question.objects.create(
                title=title,
                language=language,
                language_id=language_id,
                details=details,
                code_snippet=code_snippet,
                tags=tags,
                author=user
            )
            
            user = user
            user.questions.add(question)   

            return JsonResponse({'success': 'Question created successfully', 'question_id': question._id}, status=201)

        except (KeyError, json.JSONDecodeError) as e:
            return JsonResponse({'error': f'Malformed data: {str(e)}'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def edit_question(request: HttpRequest, question_id: int) -> HttpResponse:
    """
    Edit an existing question.
    This view allows the owner of a question or an admin to edit the details of a question.
    The request must include the User-ID in the headers and the question details in the body.
    Args:
        request (HttpRequest): The HTTP request object containing headers and body data.
        question_id (int): The ID of the question to be edited.
    Returns:
        HttpResponse: A JSON response indicating the success or failure of the operation.
    Raises:
        JsonResponse: Various JSON responses with appropriate status codes:
            - 400 if the question_id or User-ID is missing, or if the request body is malformed.
            - 403 if the user is not authorized to edit the question.
            - 404 if the question does not exist.
            - 500 if an unexpected error occurs.
    """
    if not question_id:
        return JsonResponse({'error': 'Comment ID parameter is required'}, status=400)

    user_id = request.headers.get('User-ID', None)
    if user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)
    
    user_id = int(user_id)
    
    editor_user = User.objects.get(user_id=user_id)

    try:
        question = Question.objects.get(_id=question_id)
        question_owner_user_id = question.author.user_id

        if editor_user.user_id != question_owner_user_id and editor_user.userType != UserType.ADMIN:
            return JsonResponse({'error': 'Only admins and owner of the questions can edit questions'}, status=403)

        data = json.loads(request.body)
        Lang2ID = get_languages()

        question.title = data.get('title', question.title)
        language = data.get('language', question.language)
        question.language = language
        question.language_id = Lang2ID.get(language)
        question.details = data.get('details', question.details)
        question.code_snippet = data.get('code_snippet', question.code_snippet)

        question.tags = data.get('tags', question.tags)
        question.save()

        return JsonResponse({'success': 'Question edited successfully'}, status=200)

    except Question.DoesNotExist:
        return JsonResponse({'error': 'Question not found'}, status=404)


    except (KeyError, json.JSONDecodeError) as e:
        return JsonResponse({'error': f'Malformed data: {str(e)}'}, status=400)

    except Exception as e:
        print(e)
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)

@csrf_exempt
@invalidate_user_cache()
def delete_question(request: HttpRequest, question_id: int) -> HttpResponse:
    """
    Deletes a question based on the provided question ID.
    Args:
        request (HttpRequest): The HTTP request object containing headers and user information.
        question_id (int): The ID of the question to be deleted.
    Returns:
        HttpResponse: A JSON response indicating the result of the delete operation.
            - 400 if the question ID or user ID is not provided.
            - 403 if the user is neither the owner of the question nor an admin.
            - 404 if the question does not exist.
            - 500 if an unexpected error occurs.
            - 200 if the question is successfully deleted.
    """
    if not question_id:
        return JsonResponse({'error': 'Comment ID parameter is required'}, status=400)

    user_id = request.headers.get('User-ID', None)
    if user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)
    
    user_id = int(user_id)
    
    deletor_user = User.objects.get(user_id=user_id)

    try:
        question = Question.objects.get(_id=question_id)
        question_owner_user_id = question.author.user_id

        if deletor_user.user_id != question_owner_user_id and deletor_user.userType != UserType.ADMIN:
            return JsonResponse({'error': 'Only admins and owner of the questions can delete questions'}, status=403)

        question.delete()
        return JsonResponse({'success': 'Question Deleted Successfully'}, status=200)

        #return JsonResponse({'success': 'Question deleted successfully'}, status=200)

    except Question.DoesNotExist:
        return JsonResponse({'error': 'Question not found'}, status=404)
    except Exception as e:
        print(e)
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)


@csrf_exempt
@invalidate_user_cache()
def mark_as_answered(request, question_id : int) -> HttpResponse:
    """
    Marks a question as answered.
    Args:
        request (HttpRequest): The HTTP request object containing headers and other request data.
        question_id (int): The ID of the question to be marked as answered.
    Returns:
        HttpResponse: A JSON response indicating the success or failure of the operation.
            - 200: If the question is successfully marked as answered.
            - 400: If the question ID or User ID is missing.
            - 403: If the request user is not the author of the question.
    Raises:
        Question.DoesNotExist: If the question with the given ID does not exist.
    """
    if not question_id:
        return JsonResponse({'error': 'Question ID parameter is required'}, status=400)

    request_user_id = request.headers.get('User-ID', None)
    if request_user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)
    
    request_user_id = int(request_user_id)

    question = Question.objects.get(_id=question_id)
    author: User = question.author
    if author.user_id != request_user_id:
        return JsonResponse({'error': 'Only the owner of the question can mark it as answered'}, status=403)
    
    # question.mark_as_answered() #TODO ADD COMMENT ID HERE

    return JsonResponse({'success': 'Question marked as answered successfully'}, status=200)


# TODO: FIND OUT WHAT TO DO WITH REPORTED QUESTIONS
@csrf_exempt
def report_question(request, question_id : int) -> HttpResponse:    
    """
    Report a question by a user.
    This view handles the reporting of a question by a user. It requires the question ID as a URL parameter
    and the user ID in the request headers.
    Args:
        request (HttpRequest): The HTTP request object.
        question_id (int): The ID of the question to be reported.
    Returns:
        HttpResponse: A JSON response indicating success or failure of the operation.
    Raises:
        JsonResponse: If the question ID is not provided, returns a JSON response with an error message and status 400.
        JsonResponse: If the user ID is not provided in the headers, returns a JSON response with an error message and status 400.
    """
    if not question_id:
        return JsonResponse({'error': 'Question ID parameter is required'}, status=400)

    question = Question.objects.get(_id=question_id)

    user_id = request.headers.get('User-ID', None)
    if user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)
    
    user_id = int(user_id)
    
    reporter_user = User.objects.get(pk=user_id)

    question.reported_by.add(reporter_user)
    question.save()

    return JsonResponse({'success': 'Question reported successfully'}, status=200)


@csrf_exempt
def list_questions_by_language(request, language: str, page_number = 1, return_data_only = False) -> HttpResponse:    
    """
    List questions filtered by programming language with pagination.
    Args:
        request: The HTTP request object.
        language (str): The programming language to filter questions by.
        page_number (int, optional): The page number for pagination. Defaults to 1.
    Returns:
        HttpResponse: A JSON response containing a list of questions filtered by the specified language.
                      If the language parameter is not provided, returns an error response with status 400.
    """
    if not language:
        return JsonResponse({'error': 'Language parameter is required'}, status=400)

    questions = Question.objects.filter(language__iexact=language)[10 * (page_number - 1): 10 * page_number]

    questions_data = [{
        'id': question._id,
        'title': question.title,
        'programmingLanguage': question.language,
        'tags': question.tags,
        'details': question.details,
        'code_snippet': question.code_snippet,
        'upvotes': question.upvotes,
        'author': question.author.username,
        'creationDate': question.created_at .strftime('%Y-%m-%d %H:%M:%S'),
    } for question in questions]

    if return_data_only:
        return questions_data

    return JsonResponse({'questions': questions_data}, safe=False, status=200)


@csrf_exempt
def list_questions_by_tags(request, tags: str, page_number=1) -> HttpResponse:
    """
    List questions filtered by tags with pagination.
    Args:
        request: The HTTP request object.
        tags (str): A comma-separated string of tags to filter questions by.
        page_number (int, optional): The page number for pagination. Defaults to 1.
    Returns:
        HttpResponse: A JSON response containing a list of questions filtered by the specified tags.
                      Each question includes id, title, language, tags, details, code snippet, upvotes, and creation date.
                      If the tags parameter is missing, returns a JSON response with an error message and status 400.
    """
    if not tags:
        return JsonResponse({'error': 'Tags parameter is required'}, status=400)

    # Convert the tags string to a list
    tags_list = tags.split(',')

    questions = Question.objects.filter(tags__overlap=tags_list)[10 * (page_number - 1): 10 * page_number]

    questions_data = [{
        'id': question._id,
        'title': question.title,
        'language': question.language,
        'tags': question.tags,
        'details': question.details,
        'code_snippet': question.code_snippet,
        'upvotes': question.upvotes,
        'creationDate': question.created_at.strftime('%Y-%m-%d %H:%M:%S'),
    } for question in questions]

    return JsonResponse({'questions': questions_data}, safe=False, status=200)


@csrf_exempt
def list_questions_by_hotness(request, page_number=1):
    """
    List questions ordered by hotness (number of upvotes) in a paginated manner.
    Args:
        request (HttpRequest): The HTTP request object.
        page_number (int, optional): The page number for pagination. Defaults to 1.
    Returns:
        JsonResponse: A JSON response containing a list of questions with their details.
            Each question includes the following fields:
            - id (int): The unique identifier of the question.
            - title (str): The title of the question.
            - language (str): The programming language related to the question.
            - tags (list): A list of tags associated with the question.
            - details (str): The detailed description of the question.
            - code_snippet (str): The code snippet related to the question.
            - upvotes (int): The number of upvotes the question has received.
            - creationDate (str): The creation date of the question in 'YYYY-MM-DD HH:MM:SS' format.
    """
    questions = Question.objects.order_by('-upvotes')[10 * (page_number - 1): 10 * page_number]

    questions_data = [{
        'id': question._id,
        'title': question.title,
        'language': question.language,
        'tags': question.tags,
        'details': question.details,
        'code_snippet': question.code_snippet,
        'upvotes': question.upvotes,
        'creationDate': question.created_at.strftime('%Y-%m-%d %H:%M:%S'),
    } for question in questions]

    return JsonResponse({'questions': questions_data}, safe=False, status=200)
    
@csrf_exempt   
def list_questions_by_time(request, page_number=1):
    """
    List questions ordered by creation date (most recent first) in a paginated manner.
    Args:
        request (HttpRequest): The HTTP request object.
        page_number (int, optional): The page number for pagination. Defaults to 1.
    Returns:
        JsonResponse: A JSON response containing a list of questions with their details.
            Each question includes the following fields:
            - id (int): The unique identifier of the question.
            - title (str): The title of the question.
            - language (str): The programming language related to the question.
            - tags (list): A list of tags associated with the question.
            - details (str): The detailed description of the question.
            - code_snippet (str): The code snippet related to the question.
            - upvotes (int): The number of upvotes the question has received.
            - creationDate (str): The creation date of the question in 'YYYY-MM-DD HH:MM:SS' format.
    """
    questions = Question.objects.order_by('-created_at')[10 * (page_number - 1): 10 * page_number]
    questions_data = [{
        'id': question._id,
        'title': question.title,
        'language': question.language,
        'tags': question.tags,
        'details': question.details,
        'code_snippet': question.code_snippet,
        'upvotes': question.upvotes,
        'creationDate': question.created_at.strftime('%Y-%m-%d %H:%M:%S'),
    } for question in questions]

    return JsonResponse({'questions': questions_data}, safe=False, status=200)

def random_questions(request):
    # Retrieve 5 random questions
    questions = Question.objects.order_by('?')[:5]

    questions_data = [{
        'id': question._id,
        'title': question.title,
        'description': question.details,
        'user_id': question.author.pk,
        'upvotes': question.upvotes,
        'comments_count': question.comments.count(),
        'programmingLanguage': question.language,
        'codeSnippet': question.code_snippet,
        'tags': question.tags,
        'answered': question.answered,
    } for question in questions]
    print(questions_data)
    return JsonResponse({'questions': questions_data}, safe=False)


@csrf_exempt
def question_of_the_day(request):
    """
    Retrieve the question of the day. If a question has already been selected and cached for today, 
    it will be returned from the cache. Otherwise, a random question will be selected from the database, 
    cached, and returned.
    Args:
        request (HttpRequest): The HTTP request object.
    Returns:
        JsonResponse: A JSON response containing the question of the day or an error message if no questions are available.
    Raises:
        None
    Notes:
        - The question is cached until midnight of the current day.
        - The cache key is generated based on the current date.
        - If no questions are available in the database, a 404 error is returned.
    """
    today = timezone.now().date()
    cache_key = f"question_of_the_day_{today}"

    # Check if there's a question already cached for today
    question_data = cache.get(cache_key)

    if not question_data:
        all_questions = list(Question.objects.all())
        if not all_questions:
            return JsonResponse({'error': 'No questions available'}, status=404)

        question = random.choice(all_questions)

        question_data = {
            'id': question._id,
            'title': question.title,
            'description': question.details,
            'user_id': question.author.pk,
            'upvotes': question.upvotes,
            'comments_count': question.comments.count(),
            'programmingLanguage': question.language,
            'codeSnippet': question.code_snippet,
            'tags': question.tags,
            'answered': question.answered,
        }

        today = timezone.localdate()  # This gives you a timezone-aware date object
        midnight = datetime.combine(today, datetime.min.time(), tzinfo=timezone.get_current_timezone())
        seconds_until_midnight = (midnight + timezone.timedelta(days=1) - timezone.now()).seconds
        cache.set(cache_key, question_data, timeout=seconds_until_midnight)

    return JsonResponse({'question': question_data}, safe=False)


@csrf_exempt
def list_questions_according_to_the_user(request, user_id: int):
    """
    List personalized questions for a user based on their known languages, interested topics, and general questions.

    Args:
        request (HttpRequest): The HTTP request object.
        user_id (int): The ID of the user for whom to list questions.

    Returns:
        JsonResponse: A JSON response containing a list of personalized questions.

    The function performs the following steps:
    1. Fetches the user based on the provided user_id.
    2. Retrieves questions based on the user's known programming languages.
    3. If fewer than 10 questions are found, retrieves questions based on the user's interested topics.
    4. If still fewer than 10 questions are found, fills the remaining slots with general questions.
    5. Constructs a list of question data dictionaries to be returned in the JSON response.

    The question data dictionary includes:
        - id: The question's unique identifier.
        - title: The title of the question.
        - description: The details of the question.
        - user_id: The ID of the user who authored the question.
        - likes: The number of upvotes the question has received.
        - comments_count: The number of comments on the question.
        - programmingLanguage: The programming language associated with the question.
        - codeSnippet: The code snippet included in the question.
        - tags: The tags associated with the question.
        - answered: Whether the question has been answered.
        - topic: The topic of the question.
    """
    unique_question_ids = set()
    personalized_questions = []
    user: User = get_user_model().objects.get(pk=user_id)

    # Fetch questions based on known languages
    for language in user.known_languages:
        language_questions = list(Question.objects.filter(language=language))
        for question in language_questions:
            if question._id not in unique_question_ids:
                personalized_questions.append(question)
                unique_question_ids.add(question._id)
                if len(personalized_questions) >= 10:
                    break
        if len(personalized_questions) >= 10:
            break

    if len(personalized_questions) < 10:
        for topic in user.interested_topics:
            topic_questions = list(Question.objects.filter(tags__contains=topic))
            for question in topic_questions:
                if question._id not in unique_question_ids:
                    personalized_questions.append(question)
                    unique_question_ids.add(question._id)
                    if len(personalized_questions) >= 10:
                        break
            if len(personalized_questions) >= 10:
                break

    # If still less than 10 questions, fill with general questions
    if len(personalized_questions) < 10:
        general_questions = list(
            Question.objects.exclude(_id__in=unique_question_ids)[:10 - len(personalized_questions)])
        personalized_questions.extend(general_questions)

    questions_data = [{
        'id': question._id,
        'title': question.title,
        'description': question.details,
        'user_id': question.author.pk,
        'upvotes': question.upvotes,
        'comments_count': question.comments.count(),
        'programmingLanguage': question.language,
        'codeSnippet': question.code_snippet,
        'tags': question.tags,
        'answered': question.answered,
        'author': question.author.username,
        'upvoted_by': [vote.user.username for vote in question.votes.filter(vote_type=VoteType.UPVOTE.value)],
        'downvoted_by': [vote.user.username for vote in question.votes.filter(vote_type=VoteType.DOWNVOTE.value)],
    } for question in personalized_questions]
    return JsonResponse({'questions': questions_data}, safe=False)

@csrf_exempt
def bookmark_question(request: HttpRequest, question_id: int) -> HttpResponse:
    """
    Bookmark a question for a user.
    Args:
        request (HttpRequest): The HTTP request object containing headers and other request data.
        question_id (int): The ID of the question to be bookmarked.
    Returns:
        HttpResponse: A JSON response indicating success or failure of the bookmark operation.
    Raises:
        JsonResponse: If the question_id is not provided, returns a JSON response with an error message and status 400.
        JsonResponse: If the User-ID header is not provided, returns a JSON response with an error message and status 400.
        JsonResponse: If the user_id is not valid, returns a JSON response with an error message and status 400.
    """
    if not question_id:
        return JsonResponse({'error': 'Question ID parameter is required'}, status=400)
    
    user_id = request.headers.get('User-ID', None)
    if user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)
    
    user_id = int(user_id)
    
    if not user_id:
        return JsonResponse({'error': 'User ID parameter is required'}, status=400)
    
    user = User.objects.get(pk=user_id)
    question = Question.objects.get(_id=question_id)
    
    user.bookmarks.add(question)
    
    return JsonResponse({'success': 'Question bookmarked successfully'}, status=200)

@csrf_exempt
def remove_bookmark(request: HttpRequest, question_id: int) -> HttpResponse:
    """
    Remove a question from a user's bookmarks.
    This endpoint handles the removal of a question from a user's bookmarks list.
    Args:
        request (HttpRequest): The HTTP request object containing the User-ID in headers.
        question_id (int): The ID of the question to be removed from bookmarks.
    Returns:
        HttpResponse: A JSON response indicating success or failure.
            - On success: {'success': 'Bookmark removed successfully'} with status 200
            - On failure: {'error': error_message} with status 400
    Raises:
        User.DoesNotExist: If no user is found with the given user_id
        Question.DoesNotExist: If no question is found with the given question_id
    Example:
        To remove a bookmark:
        DELETE /api/bookmarks/remove/123
        Headers: User-ID: 456
    """
    if not question_id:
        return JsonResponse({'error': 'Question ID parameter is required'}, status=400)
    
    user_id = request.headers.get('User-ID', None)
    if user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)
    
    user_id = int(user_id)
    
    if not user_id:
        return JsonResponse({'error': 'User ID parameter is required'}, status=400)
    
    user = User.objects.get(pk=user_id)
    question = Question.objects.get(_id=question_id)
    
    user.bookmarks.remove(question)
    
    return JsonResponse({'success': 'Bookmark removed successfully'}, status=200)

@csrf_exempt
def fetch_random_reported_question(request: HttpRequest) -> HttpResponse:
    """
    Fetches a random question that has been reported by users.
    This endpoint retrieves all questions that have a non-empty reported_by field and randomly selects one to return.
    The response includes detailed information about the question including its metadata, author, votes, and reports.
    Args:
        request (HttpRequest): The HTTP request object
    Returns:
        HttpResponse: A JSON response containing either:
            - The randomly selected reported question with all its details
            - An error message if no reported questions are found (status 404)
    Response format:
        {
            'question': {
                'id': str,
                'title': str, 
                'language': str,
                'tags': list,
                'details': str,
                'code_snippet': str,
                'upvote_count': int,
                'creationDate': str,
                'author': str,
                'comments_count': int,
                'answered': bool,
                'topic': str,
                'reported_by': list[str],
                'upvoted_by': list[str],
                'downvoted_by': list[str]
    """
    # Written in order to fetch all questions with non-empty reported_by field. Then we are selecting one of them randomly
    reported_questions = Question.objects.annotate(num_reports=Count('reported_by')).filter(num_reports__gt=0)

    if not reported_questions.exists():
        return JsonResponse({'error': 'No reported questions found'}, status=404)
    
    question = random.choice(reported_questions)
    
    question_data = {
        'id': question._id,
        'title': question.title,
        'language': question.language,
        'tags': question.tags,
        'details': question.details,
        'code_snippet': question.code_snippet,
        'upvote_count': question.upvotes,
        'creationDate': question.created_at .strftime('%Y-%m-%d %H:%M:%S'),
        'author' : question.author.username,
        'comments_count': question.comments.count(),
        'answered': question.answered,
        'reported_by': [user.username for user in question.reported_by.all()],
        'upvoted_by': [vote.user.username for vote in question.votes.filter(vote_type=VoteType.UPVOTE.value)],
        'downvoted_by': [vote.user.username for vote in question.votes.filter(vote_type=VoteType.DOWNVOTE.value)],   
    }
    
    return JsonResponse({'question': question_data}, safe=False)

@csrf_exempt
def fetch_all_feed_at_once(request, user_id: int):
    import time
    time_start = time.time()
    cache_key = f"feed_user_{user_id}"
    
    feed_data = cache.get(cache_key)
    if feed_data:
        return JsonResponse(feed_data, safe=False)

    def get_questions_for_user(user_id):
        user = get_user_model().objects.get(pk=user_id)
        user_votes = Question_Vote.objects.filter(user_id=user_id).values('question_id', 'vote_type')
        user_votes_dict = {vote['question_id']: vote['vote_type'] for vote in user_votes}
        
        questions = (
            Question.objects.filter(
                Q(language__in=user.known_languages) | Q(tags__overlap=user.interested_topics)
            )
            .distinct()[:10]
        )

        if len(questions) < 10:
            general_questions = Question.objects.exclude(
                pk__in=[q.pk for q in questions]
            ).order_by('?')[:10 - len(questions)]
            questions = list(questions) + list(general_questions)

        return [
            {
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
                'created_at' : q.created_at.strftime('%Y-%m-%d %H:%M:%S')
            }
            for q in questions
        ]

    def get_question_of_the_day():
        today = timezone.now().date()
        cache_key = f"question_of_the_day_{today}"

        question_data = cache.get(cache_key)
        if not question_data:
            question = Question.objects.order_by('?').first()
            if not question:
                return {'error': 'No questions available'}

            question_data = {
                'id': question._id,
                'title': question.title,
                'description': question.details,
                'user_id': question.author.pk,
                'upvotes': question.upvotes,
                'username': question.author.username,
                'comments_count': question.comments.count(),
                'programmingLanguage': question.language,
                'codeSnippet': question.code_snippet,
                'tags': question.tags,
                'answered': question.answered,
            }

            seconds_until_midnight = (timezone.localtime().replace(hour=23, minute=59, second=59) - timezone.localtime()).seconds
            cache.set(cache_key, question_data, timeout=seconds_until_midnight)

        return question_data

    def get_top_5_contributors():
        contributors = (
            User.objects.annotate(
                question_points=Count('questions') * 2,
                comment_points=Count('authored_comments', filter=Q(authored_comments__answer_of_the_question=False))
                + Count('authored_comments', filter=Q(authored_comments__answer_of_the_question=True)) * 5,
            )
            .annotate(total_points=F('question_points') + F('comment_points'))
            .order_by('-total_points')[:5]
        )

        return [
            {
                'username': user.username,
                'email': user.email,
                'name': user.name,
                'surname': user.surname,
                'contribution_points': user.total_points,
            }
            for user in contributors
        ]

    # Fetch the data concurrently
    with ThreadPoolExecutor() as executor:
        future_questions = executor.submit(get_questions_for_user, user_id)
        future_question_of_the_day = executor.submit(get_question_of_the_day)
        future_top_contributors = executor.submit(get_top_5_contributors)

        questions = future_questions.result()
        question_of_the_day = future_question_of_the_day.result()
        top_contributors = future_top_contributors.result()

    # Combine all data
    feed_data = {
        'personalized_questions': questions,
        'question_of_the_day': question_of_the_day,
        'top_contributors': top_contributors
    }

    # Cache the feed data for a specified amount of time
    cache.set(cache_key, feed_data, timeout=3600)  # Cache for 1 hour (3600 seconds)

    print(f"Time taken: {time.time() - time_start:.2f} seconds")
    return JsonResponse(feed_data, safe=False)

def get_all_questions(request):
    questions = Question.objects.all()
    questions_data = [{
        'id': question._id,
        'title': question.title,
        'language': question.language,
        'tags': question.tags,
        'details': question.details,
        'code_snippet': question.code_snippet,
        'upvotes': question.upvotes,
        'creationDate': question.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        'author': question.author.username,
        'comments_count': question.comments.count(),
        'answered': question.answered,
        'reported_by': [user.username for user in question.reported_by.all()],
        'upvoted_by': [vote.user.username for vote in question.votes.filter(vote_type=VoteType.UPVOTE.value)],
        'downvoted_by': [vote.user.username for vote in question.votes.filter(vote_type=VoteType.DOWNVOTE.value)]
    } for question in questions]

    return JsonResponse({'questions': questions_data}, safe=False)
    
def get_topic_url(request, topic_name: str):
    related_url = Topic.get_url_for_topic(topic_name)
    if related_url:
        return JsonResponse({'topic': topic_name, 'url': related_url}, status=200)
    return JsonResponse({'error': f'Topic "{topic_name}" not found'}, status=404)


def list_all_topics(request):
    topics = Topic.get_all_topics()
    topics_data = [{'name': topic.name, 'url': topic.related_url} for topic in topics]
    return JsonResponse({'topics': topics_data}, status=200)


def fetch_question_label_info(request, question_id: int):
    try:
        question = Question.objects.get(_id=question_id)
        tags_info = question.tags
        return JsonResponse({
            'question_id': question_id,
            'tags': tags_info
        }, status=200)
    except Question.DoesNotExist:
        return JsonResponse({'error': 'Question not found'}, status=404)

@csrf_exempt
def get_code_snippet_if_empty(request, question_id: int) -> HttpResponse:
    """
    Retrieve the code snippet for a question if it's empty.
    If the `code_snippet` is empty, an alternative logic can be applied to generate or fetch a snippet.
    """
    try:
        question = Question.objects.get(_id=question_id)
        
        if not question.code_snippet.strip():
            # Example logic: Attempt to fetch a snippet based on the question details or tags
            suggested_snippet = f"# Example snippet for {question.title}\ndef example_function():\n    pass"
            return JsonResponse({'codeSnippet': suggested_snippet}, status=200)

        return JsonResponse({'codeSnippet': question.code_snippet}, status=200)
    except Question.DoesNotExist:
        return JsonResponse({'error': 'Question not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def fetch_search_results_at_once(request, wiki_id, language, page_number = 1):
    mock_request = HttpRequest()
    mock_request.method = 'GET'
    wiki_id_numerical_part = ''.join(filter(str.isdigit, wiki_id))

    def get_info():
        return wiki_result('', wiki_id, return_data_only=True)
    
    def get_questions():
        return list_questions_by_language('', language, page_number, return_data_only=True)
    
    def get_annotations():
        return get_annotations_by_language(mock_request, wiki_id_numerical_part, return_data_only=True)

    with ThreadPoolExecutor(max_workers=3) as executor:
        info_future = executor.submit(get_info)
        questions_future = executor.submit(get_questions)
        annotations_future = executor.submit(get_annotations)

        information_result = info_future.result()
        question_result = questions_future.result()
        annotation_result = annotations_future.result()

    return JsonResponse({
        'information': information_result,
        'questions': question_result,
        'annotations': annotation_result
    }, safe=False)