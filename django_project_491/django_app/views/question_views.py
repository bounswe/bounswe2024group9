
from ..models import Question, Comment, UserType, User, VoteType, Question_Vote, QuestionType
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
from datetime import timedelta
from .utilization_views import wiki_result
from .annotation_views import get_annotations_by_language
from django.http import HttpRequest
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.db.models import Count
from itertools import chain
from collections import Counter

from annotations_app.models import Annotation

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
        annotation_details: List[Annotation] = get_annotations_by_language("question", question._id)
        annotation_codes: List[Annotation] = get_annotations_by_language("question_code", question._id)

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
            'downvoted_by': [vote.user.username for vote in question.votes.filter(vote_type=VoteType.DOWNVOTE.value)],
            'annotations': annotation_details,
            'annotation_codes': annotation_codes,
            'post_type': question.type
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
        comments: List[Comment] = question.comments.all().order_by('-upvotes')

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
            'answer_of_the_question': comment.answer_of_the_question,
            'annotations': get_annotations_by_language("comment", comment._id),
            'annotation_codes': get_annotations_by_language("comment_code", comment._id)
        } for comment in comments]

        return JsonResponse({'comments': comments_data}, status=200)

    except Question.DoesNotExist:
        return JsonResponse({'error': 'Question not found'}, status=404)

@swagger_auto_schema(
    tags=['Question'],
   method='post',
   operation_summary="Create Question",
   operation_description="""Create a new question with title, language, details, and optional code snippet and tags.
   The question will be validated for quality before creation.""",
   manual_parameters=[
       openapi.Parameter(
           name='User-ID',
           in_=openapi.IN_HEADER,
           type=openapi.TYPE_INTEGER,
           description="ID of the user creating the question",
           required=True
       ),
   ],
   request_body=openapi.Schema(
       type=openapi.TYPE_OBJECT,
       required=['title', 'language', 'details'],
       properties={
           'title': openapi.Schema(
               type=openapi.TYPE_STRING,
               description="Title of the question"
           ),
           'language': openapi.Schema(
               type=openapi.TYPE_STRING,
               description="Programming language related to the question"
           ),
           'details': openapi.Schema(
               type=openapi.TYPE_STRING,
               description="Detailed description of the question"
           ),
           'code_snippet': openapi.Schema(
               type=openapi.TYPE_STRING,
               description="Code snippet related to the question",
               default=""
           ),
           'tags': openapi.Schema(
               type=openapi.TYPE_ARRAY,
               items=openapi.Schema(
                   type=openapi.TYPE_STRING
               ),
               description="List of tags associated with the question",
               default=[]
           ),'type': openapi.Schema(
                type=openapi.TYPE_STRING,
                description="Type of the question",
                default=QuestionType.QUESTION.value,
                enum=[QuestionType.QUESTION.value, QuestionType.DISCUSSION.value]
            )
       }
   ),
   responses={
       201: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'success': openapi.Schema(
                   type=openapi.TYPE_STRING,
                   description="Success message",
                   example="Question created successfully"
               ),
               'question_id': openapi.Schema(
                   type=openapi.TYPE_INTEGER,
                   description="ID of the created question"
               )
           }
       ),
       400: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(
                   type=openapi.TYPE_STRING,
                   description="Error message",
                   example="Invalid language or Question is not valid or Malformed data"
               )
           }
       ),
       405: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(
                   type=openapi.TYPE_STRING,
                   description="Method not allowed error",
                   example="Invalid request method"
               )
           }
       )
   }
)
@api_view(['POST'])
@permission_classes([AllowAny])
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
            language = data.get('language', "")
            details = data.get('details')
            code_snippet = data.get('code_snippet', '')  # There may not be a code snippet
            tags = data.get('tags', [])  # There may not be any tags
            question_type = data.get('post_type', QuestionType.QUESTION.value) 

            if question_type not in [tag.value for tag in QuestionType]:
                return JsonResponse({'error': 'Invalid question type'}, status=400)

            if question_type == QuestionType.DISCUSSION.value:
                code_snippet = ""
                language_id = -1
            else:
                if not language:
                    return JsonResponse({'error': 'For Code Questions add a language.'}, status=400)
                else:
                    Lang2ID = get_languages()
                    language_id = Lang2ID.get(language, None)
                    if language_id is None:
                        return JsonResponse({'error': 'Invalid language'}, status=400)

            user = User.objects.get(pk=request.headers.get('User-ID', None))

            # try:
            #     question_controller = QuestionQualityController()
            #     is_valid_question = question_controller.is_valid_question(data)
            #     if(not is_valid_question):
            #         print("Question is not valid")
            #         return JsonResponse({'error': 'Question is not approved by LLM'}, status=400)
            # except Exception as e:
            #     print(e)

            question = Question.objects.create(
                title=title,
                language=language,
                language_id=language_id,
                details=details,
                code_snippet=code_snippet,
                tags=tags,
                type=question_type,
                author=user
            )
            
            user = user
            user.questions.add(question)   

            return JsonResponse({'success': 'Question created successfully', 'question_id': question._id}, status=201)

        except (KeyError, json.JSONDecodeError) as e:
            return JsonResponse({'error': f'Malformed data: {str(e)}'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@swagger_auto_schema(
   method='put',
   tags=['Question'],
   operation_summary="Edit Question",
   operation_description="Edit an existing question. Only the question owner or admin can edit.",
   manual_parameters=[
       openapi.Parameter(
           name='User-ID',
           in_=openapi.IN_HEADER,
           type=openapi.TYPE_INTEGER,
           description="ID of the user attempting to edit the question",
           required=True
       ),
       openapi.Parameter(
           name='question_id',
           in_=openapi.IN_PATH,
           type=openapi.TYPE_INTEGER,
           description="ID of the question to be edited",
           required=True
       ),
   ],
   request_body=openapi.Schema(
       type=openapi.TYPE_OBJECT,
       properties={
           'title': openapi.Schema(type=openapi.TYPE_STRING, description="Updated question title"),
           'language': openapi.Schema(type=openapi.TYPE_STRING, description="Updated programming language"),
           'details': openapi.Schema(type=openapi.TYPE_STRING, description="Updated question details"),
           'code_snippet': openapi.Schema(type=openapi.TYPE_STRING, description="Updated code snippet"),
           'tags': openapi.Schema(
               type=openapi.TYPE_ARRAY,
               items=openapi.Schema(type=openapi.TYPE_STRING),
               description="Updated list of tags"
           )
       }
   ),
   responses={
       200: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'success': openapi.Schema(type=openapi.TYPE_STRING, example="Question edited successfully")
           }
       ),
       400: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(type=openapi.TYPE_STRING, example="Malformed data")
           }
       ),
       403: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(type=openapi.TYPE_STRING, example="Only admins and owner of the questions can edit questions")
           }
       ),
       404: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(type=openapi.TYPE_STRING, example="Question not found")
           }
       ),
       500: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(type=openapi.TYPE_STRING, example="An error occurred")
           }
       )
   }
)
@permission_classes([AllowAny])
@api_view(['PUT'])
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
        question.language_id = Lang2ID.get(language, -1)
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

@swagger_auto_schema(
   method='delete',
   tags=['Question'],
   operation_summary="Delete Question",
   operation_description="Delete an existing question. Only the question owner or admin can delete.",
   manual_parameters=[
       openapi.Parameter(
           name='User-ID',
           in_=openapi.IN_HEADER,
           type=openapi.TYPE_INTEGER,
           description="ID of the user attempting to delete the question",
           required=True
       ),
       openapi.Parameter(
           name='question_id',
           in_=openapi.IN_PATH,
           type=openapi.TYPE_INTEGER,
           description="ID of the question to be deleted",
           required=True
       ),
   ],
   responses={
       200: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'success': openapi.Schema(type=openapi.TYPE_STRING, example="Question Deleted Successfully")
           }
       ),
       400: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(type=openapi.TYPE_STRING, example="User ID parameter is required in the header")
           }
       ),
       403: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(type=openapi.TYPE_STRING, example="Only admins and owner of the questions can delete questions")
           }
       ),
       404: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(type=openapi.TYPE_STRING, example="Question not found")
           }
       ),
       500: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(type=openapi.TYPE_STRING, example="An error occurred")
           }
       )
   }
)
@csrf_exempt
@api_view(['DELETE'])
@permission_classes([AllowAny])
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
@permission_classes([AllowAny])
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

@swagger_auto_schema(
   method='get',
   tags=['Question'],
   operation_summary="List Questions by Language",
   operation_description="Retrieve a paginated list of questions filtered by programming language",
   manual_parameters=[
       openapi.Parameter(
           name='language',
           in_=openapi.IN_PATH,
           type=openapi.TYPE_STRING,
           description="Programming language to filter questions by",
           required=True
       ),
       openapi.Parameter(
           name='page_number',
           in_=openapi.IN_PATH,
           type=openapi.TYPE_INTEGER,
           description="Page number for pagination (10 items per page)",
           default=1
       )
   ],
   responses={
       200: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'questions': openapi.Schema(
                   type=openapi.TYPE_ARRAY,
                   items=openapi.Schema(
                       type=openapi.TYPE_OBJECT,
                       properties={
                           'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                           'title': openapi.Schema(type=openapi.TYPE_STRING),
                           'programmingLanguage': openapi.Schema(type=openapi.TYPE_STRING),
                           'tags': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_STRING)),
                           'details': openapi.Schema(type=openapi.TYPE_STRING),
                           'code_snippet': openapi.Schema(type=openapi.TYPE_STRING),
                           'upvotes': openapi.Schema(type=openapi.TYPE_INTEGER),
                           'author': openapi.Schema(type=openapi.TYPE_STRING),
                           'creationDate': openapi.Schema(type=openapi.TYPE_STRING, format='date-time')
                       }
                   )
               )
           }
       ),
       400: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(type=openapi.TYPE_STRING, example="Language parameter is required")
           }
       )
   }
)
@api_view(['GET'])
@csrf_exempt
@permission_classes([AllowAny])
def list_questions_by_language_request(request, user_id, language: str, page_number = 1, return_data_only = False) -> HttpResponse:    
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

    questions_data , page_count= list_questions_by_language(user_id, language, page_number)

    return JsonResponse({'questions': questions_data, 'page_count': page_count}, safe=False, status=200)


def list_questions_by_language(user_id: int, language: str, page_number = 1) -> List[Question]:
    questions = Question.objects.filter(language__istartswith=language)[10 * (page_number - 1): 10 * page_number]

    if not questions.exists():
        # Case insensitive search in JSON array
        questions = Question.objects.filter(tags__contains=[language.title()])
        if not questions.exists():
            questions = Question.objects.filter(tags__contains=[language.lower()])           
        if not questions.exists():
            questions = Question.objects.filter(tags__contains=[language.upper()])

    user = User.objects.get(pk=user_id)
    user_votes = Question_Vote.objects.filter(user_id=user_id).values('question_id', 'vote_type')
    user_votes_dict = {vote['question_id']: vote['vote_type'] for vote in user_votes}

    page_count = (questions.count() + 9) // 10

    return [{   
        'id': question.pk,
        'title': question.title,
        'description': question.details,
        'user_id': question.author.pk,
        'username': question.author.username,
        'upvotes': question.upvotes,
        'comments_count': question.comments.count(),
        'programmingLanguage': question.language,
        'codeSnippet': question.code_snippet,
        'tags': question.tags,
        'answered': question.answered,
        'is_upvoted': user_votes_dict.get(question.pk) == VoteType.UPVOTE.value,
        'is_downvoted': user_votes_dict.get(question.pk) == VoteType.DOWNVOTE.value,
        'is_bookmarked': user.bookmarks.filter(pk=question.pk).exists(),
        'created_at' : question.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        'post_type': question.type    
    } for question in questions], page_count



@swagger_auto_schema(
   method='get',
   tags=['Question'],
   operation_summary="List Questions by Tags",
   operation_description="Retrieve a paginated list of questions filtered by tags",
   manual_parameters=[
       openapi.Parameter(
           name='tags',
           in_=openapi.IN_PATH,
           type=openapi.TYPE_STRING,
           description="Comma-separated list of tags to filter questions by",
           required=True,
           example="python,django,rest"
       ),
       openapi.Parameter(
           name='page_number',
           in_=openapi.IN_PATH,
           type=openapi.TYPE_INTEGER,
           description="Page number for pagination (10 items per page)",
           default=1
       )
   ],
   responses={
       200: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'questions': openapi.Schema(
                   type=openapi.TYPE_ARRAY,
                   items=openapi.Schema(
                       type=openapi.TYPE_OBJECT,
                       properties={
                           'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                           'title': openapi.Schema(type=openapi.TYPE_STRING),
                           'language': openapi.Schema(type=openapi.TYPE_STRING),
                           'tags': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_STRING)),
                           'details': openapi.Schema(type=openapi.TYPE_STRING),
                           'code_snippet': openapi.Schema(type=openapi.TYPE_STRING),
                           'upvotes': openapi.Schema(type=openapi.TYPE_INTEGER),
                           'creationDate': openapi.Schema(type=openapi.TYPE_STRING, format='date-time')
                       }
                   )
               )
           }
       ),
       400: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(type=openapi.TYPE_STRING, example="Tags parameter is required")
           }
       )
   }
)
@api_view(['GET'])
@permission_classes([AllowAny])
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
@permission_classes([AllowAny])
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
@permission_classes([AllowAny])
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
@permission_classes([AllowAny])
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
@permission_classes([AllowAny])
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

    Each question data dictionary includes:
        - id: The question's unique identifier.
        - title: The title of the question.
        - description: The details of the question.
        - user_id: The ID of the user who authored the question.
        - upvotes: The number of upvotes the question has received.
        - comments_count: The number of comments on the question.
        - programmingLanguage: The programming language associated with the question.
        - codeSnippet: The code snippet included in the question.
        - tags: The tags associated with the question.
        - answered: Whether the question has been answered.
        - post_type: The type of the post (e.g., 'question', 'discussion').
        - author: The username of the author.
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
        'post_type': question.type,  # Include the post type
        'author': question.author.username,
        'upvoted_by': [vote.user.username for vote in question.votes.filter(vote_type=VoteType.UPVOTE.value)],
        'downvoted_by': [vote.user.username for vote in question.votes.filter(vote_type=VoteType.DOWNVOTE.value)],
    } for question in personalized_questions]

    return JsonResponse({'questions': questions_data}, safe=False)


@swagger_auto_schema(
    tags=['Question'],
    method='post',
    operation_summary="Bookmark Question",
    operation_description="Add a question to user's bookmarks",
    manual_parameters=[
        openapi.Parameter(
            name='User-ID',
            in_=openapi.IN_HEADER,
            type=openapi.TYPE_INTEGER,
            description="ID of the user bookmarking the question",
            required=True
        ),
        openapi.Parameter(
            name='question_id',
            in_=openapi.IN_PATH,
            type=openapi.TYPE_INTEGER,
            description="ID of the question to bookmark",
            required=True
        )
    ],
    responses={
        200: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'success': openapi.Schema(type=openapi.TYPE_STRING)
            }
        ),
        400: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(type=openapi.TYPE_STRING)
            }
        ),
        404: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(type=openapi.TYPE_STRING)
            }
        )
    }
)
@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
@invalidate_user_cache()
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


@swagger_auto_schema(
    tags=['Question'],
    method='delete',
    operation_summary="Remove Bookmark",
    operation_description="Remove a question from user's bookmarks",
    manual_parameters=[
        openapi.Parameter(
            name='User-ID',
            in_=openapi.IN_HEADER,
            type=openapi.TYPE_INTEGER,
            description="ID of the user removing the bookmark",
            required=True
        ),
        openapi.Parameter(
            name='question_id',
            in_=openapi.IN_PATH,
            type=openapi.TYPE_INTEGER,
            description="ID of the question to remove from bookmarks",
            required=True
        )
    ],
    responses={
        200: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'success': openapi.Schema(type=openapi.TYPE_STRING)
            }
        ),
        400: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(type=openapi.TYPE_STRING)
            }
        ),
        404: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(type=openapi.TYPE_STRING)
            }
        )
    }
)
@api_view(['DELETE'])
@csrf_exempt
@permission_classes([AllowAny])
@invalidate_user_cache()
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
@permission_classes([AllowAny])
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


@swagger_auto_schema(
    tags=['Question'],
   method='get',
   operation_summary="Fetch Complete User Feed",
   operation_description="""Retrieves a complete feed for a user including:
   - Personalized questions based on user's known languages and interests
   - Question of the day
   - Top 5 contributors
   Results are cached for 1 hour for performance.""",
   manual_parameters=[
       openapi.Parameter(
           name='user_id',
           in_=openapi.IN_PATH,
           type=openapi.TYPE_INTEGER,
           description="ID of the user to fetch feed for",
           required=True
       ),
   ],
   responses={
       200: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'personalized_questions': openapi.Schema(
                   type=openapi.TYPE_ARRAY,
                   items=openapi.Schema(
                       type=openapi.TYPE_OBJECT,
                       properties={
                           'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                           'title': openapi.Schema(type=openapi.TYPE_STRING),
                           'description': openapi.Schema(type=openapi.TYPE_STRING),
                           'user_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                           'likes': openapi.Schema(type=openapi.TYPE_INTEGER),
                           'comments_count': openapi.Schema(type=openapi.TYPE_INTEGER),
                           'programmingLanguage': openapi.Schema(type=openapi.TYPE_STRING),
                           'codeSnippet': openapi.Schema(type=openapi.TYPE_STRING),
                           'tags': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_STRING)),
                           'answered': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                           'is_upvoted': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                           'is_downvoted': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                       }
                   ),
                   description="List of personalized questions for the user"
               ),
               'question_of_the_day': openapi.Schema(
                   type=openapi.TYPE_OBJECT,
                   properties={
                       'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                       'title': openapi.Schema(type=openapi.TYPE_STRING),
                       'description': openapi.Schema(type=openapi.TYPE_STRING),
                       'user_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                       'likes': openapi.Schema(type=openapi.TYPE_INTEGER),
                       'comments_count': openapi.Schema(type=openapi.TYPE_INTEGER),
                       'programmingLanguage': openapi.Schema(type=openapi.TYPE_STRING),
                       'codeSnippet': openapi.Schema(type=openapi.TYPE_STRING),
                       'tags': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_STRING)),
                       'answered': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                   }
               ),
               'top_contributors': openapi.Schema(
                   type=openapi.TYPE_ARRAY,
                   items=openapi.Schema(
                       type=openapi.TYPE_OBJECT,
                       properties={
                           'username': openapi.Schema(type=openapi.TYPE_STRING),
                           'email': openapi.Schema(type=openapi.TYPE_STRING),
                           'name': openapi.Schema(type=openapi.TYPE_STRING),
                           'surname': openapi.Schema(type=openapi.TYPE_STRING),
                           'contribution_points': openapi.Schema(type=openapi.TYPE_INTEGER),
                       }
                   ),
                   description="List of top 5 contributors"
               )
           }
       ),
       404: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(
                   type=openapi.TYPE_STRING,
                   description="Error message when user is not found"
               )
           }
       )
   }
)
@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def fetch_all_feed_at_once(request, user_id: int):
    """
    Fetches the complete feed for a user, including personalized questions, 
    question of the day, and top contributors. The feed data is cached to 
    improve performance.
    Args:
        request: The HTTP request object.
        user_id (int): The ID of the user for whom the feed is being fetched.
    Returns:
        JsonResponse: A JSON response containing the feed data, which includes:
            - personalized_questions: A list of questions tailored to the user's 
              known languages and interested topics.
            - question_of_the_day: A randomly selected question of the day.
            - top_contributors: A list of the top 5 contributors.
    Caches:
        The feed data is cached for 1 hour (3600 seconds) using a cache key 
        specific to the user.
    Raises:
        User.DoesNotExist: If the user with the given user_id does not exist.
    """
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

        # Get total count for preferred questions
        total_preferred = questions.count()

        if len(questions) < 10:
            general_questions = Question.objects.exclude(
                pk__in=[q.pk for q in questions]
                ).order_by('-created_at')[:10 - len(questions)]
            questions = list(questions) + list(general_questions)
            total_general = Question.objects.exclude(
                    pk__in=Question.objects.filter(
                        Q(language__in=user.known_languages) | Q(tags__overlap=user.interested_topics)
                    )
                ).count()
            total_count = total_preferred + total_general
        else:
            total_count = total_preferred

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
                'is_bookmarked': user.bookmarks.filter(pk=q.pk).exists(),
                'created_at' : q.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'post_type': q.type
            }
            for q in questions
        ], (total_count + 9) // 10

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

    # Fetch the data concurrently
    with ThreadPoolExecutor() as executor:
        future_questions = executor.submit(get_questions_for_user, user_id)
        future_question_of_the_day = executor.submit(get_question_of_the_day)
        future_top_contributors = executor.submit(get_top_5_contributors)
        future_top_tags = executor.submit(get_most_popular_tags)

        questions, total_page = future_questions.result()
        question_of_the_day = future_question_of_the_day.result()
        top_contributors = future_top_contributors.result()
        top_tags = future_top_tags.result()

    # Combine all data
    feed_data = {
        'personalized_questions': questions,
        'question_of_the_day': question_of_the_day,
        'top_contributors': top_contributors,
        'top_tags': top_tags,
        'page_count': total_page
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

@swagger_auto_schema(
    tags=['Question'],
    method='get',
    operation_summary="Fetch Combined Search Results",
    operation_description="""
    Fetches and combines multiple types of search results concurrently:
    - Wiki information for the specified ID
    - Questions for the given language
    - Annotations related to the wiki ID
    """,
    manual_parameters=[
        openapi.Parameter(
            name='wiki_id',
            in_=openapi.IN_PATH,
            type=openapi.TYPE_STRING,
            description="Wiki identifier for the search",
            required=True
        ),
        openapi.Parameter(
            name='language',
            in_=openapi.IN_PATH,
            type=openapi.TYPE_STRING,
            description="Programming language to filter questions",
            required=True
        ),
        openapi.Parameter(
            name='page_number',
            in_=openapi.IN_PATH,
            type=openapi.TYPE_INTEGER,
            description="Page number for paginated results",
            default=1
        )
    ],
    responses={
        200: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'information': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    description="Wiki information results"
                ),
                'questions': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(type=openapi.TYPE_OBJECT),
                    description="Filtered questions for the specified language"
                ),
                'annotations': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(type=openapi.TYPE_OBJECT),
                    description="Related annotations for the wiki ID"
                )
            }
        ),
        404: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Error message when resources are not found"
                )
            }
        ),
        500: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Error message for concurrent execution failures"
                )
            }
        )
    }
)
@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def fetch_search_results_at_once(request, wiki_id, language, page_number=1):
    """
    Fetches search results including wiki information, questions, annotations, and top contributors concurrently.
    Args:
        request (HttpRequest): The HTTP request object containing headers and other request data.
        wiki_id (str): The identifier for the wiki.
        language (str): The language code for filtering questions and annotations.
        page_number (int, optional): The page number for paginated questions. Defaults to 1.
    Returns:
        JsonResponse: A JSON response containing the following keys:
            - 'information': The result of the wiki information fetch.
            - 'questions': The list of questions filtered by language and page number.
            - 'annotations': The annotations filtered by language.
            - 'top_contributors': The top 5 contributors.
    """

    wiki_id_numerical_part = ''.join(filter(str.isdigit, wiki_id))
    user_id = request.headers.get('User-ID', None)

    def get_info():
        return wiki_result(wiki_id)
    
    def get_questions():
        return list_questions_by_language(user_id ,language, page_number)
    
    def get_annotations():
        return get_annotations_by_language("wiki", wiki_id_numerical_part)


    with ThreadPoolExecutor(max_workers=4) as executor:
        info_future = executor.submit(get_info)
        questions_future = executor.submit(get_questions)
        annotations_future = executor.submit(get_annotations)
        top_contributors_future = executor.submit(get_top_5_contributors)
        top_tags_future = executor.submit(get_most_popular_tags)


        information_result = info_future.result()
        question_result, page_count = questions_future.result()
        annotation_result = annotations_future.result()
        top_contributors_result = top_contributors_future.result()
        top_tags_result = top_tags_future.result()

    return JsonResponse({
        'information': information_result,
        'questions': question_result,
        'page_count': page_count,
        'annotations': annotation_result,
        'top_contributors': top_contributors_result,
        'top_tags': top_tags_result
    }, safe=False)

@swagger_auto_schema(
    tags=['Question'],
    method='post',
    operation_summary="Get Filtered Questions",
    operation_description="""
    Retrieves questions based on specified filter criteria.
    All filter parameters are optional:
    - If status is not specified, returns questions with all statuses
    - If language is not specified, returns questions in all languages
    - If tags are not specified, returns questions with any tags
    - If dates are not specified, returns questions from all time periods
    """,
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'status': openapi.Schema(
                type=openapi.TYPE_STRING,
                description="Filter by question status",
                default='all',
                enum=['answered, unanswered']
            ),
            'language': openapi.Schema(
                type=openapi.TYPE_STRING,
                description="Filter by programming language",
                default=''
            ),
            'tags': openapi.Schema(
                type=openapi.TYPE_ARRAY,
                items=openapi.Schema(type=openapi.TYPE_STRING),
                description="Array of tag names to filter by",
                default=[]
            ),
            'startDate': openapi.Schema(
                type=openapi.TYPE_STRING,
                format='date',
                description="Filter questions posted on or after this date (YYYY-MM-DD)",
                example="2024-01-01"
            ),
            'endDate': openapi.Schema(
                type=openapi.TYPE_STRING,
                format='date',
                description="Filter questions posted on or before this date (YYYY-MM-DD)",
                example="2024-12-31"
            )
        }
    ),
    responses={
        200: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'questions': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                            'title': openapi.Schema(type=openapi.TYPE_STRING),
                            'status': openapi.Schema(type=openapi.TYPE_STRING),
                            'language': openapi.Schema(type=openapi.TYPE_STRING),
                            'tags': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_STRING)),
                            'created_at': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
                            'upvotes': openapi.Schema(type=openapi.TYPE_INTEGER),
                            'views': openapi.Schema(type=openapi.TYPE_INTEGER)
                        }
                    ),
                    description="List of questions matching the filter criteria"
                ),
                'total_count': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description="Total number of questions matching the filter criteria"
                )
            }
        ),
        400: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Error message for invalid filter parameters"
                )
            }
        )
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def get_questions_according_to_filter(request, page_number):
    """
    Retrieve a list of questions based on various filters provided in the request.
    Args:
        request (HttpRequest): The HTTP request object containing headers and body data.
    Returns:
        JsonResponse: A JSON response containing a list of filtered questions or an error message.
    The function supports the following filters:
    - status: Filter questions by their answered status ('answered' or 'unanswered'). Default is 'all'.
    - language: Filter questions by programming language. Default is 'all'.
    - tags: Filter questions by tags. Default is an empty list.
    - startDate: Filter questions created on or after this date (format: 'YYYY-MM-DD').
    - endDate: Filter questions created before this date (format: 'YYYY-MM-DD').
    The function also limits the number of returned questions to 10 and includes additional metadata
    such as upvotes, comments count, and user vote status (upvoted or downvoted).
    Raises:
        ValueError: If the date format for startDate or endDate is invalid.
        Exception: For any other exceptions, returns a JSON response with an error message.
    """
    try:
        user_id = request.headers.get('User-ID', None)
        user_votes = Question_Vote.objects.filter(user_id=user_id).values('question_id', 'vote_type')
        user_votes_dict = {vote['question_id']: vote['vote_type'] for vote in user_votes}
        user = User.objects.get(pk=user_id)
        # Parse the request body
        data = json.loads(request.body)
        status = data.get('status', 'all')
        language = data.get('language', 'all')
        tags = data.get('tags', [])
        start_date = data.get('startDate') 
        end_date = data.get('endDate')
        # Start with all questions, ordered by creation date
        questions = Question.objects.all().order_by('-created_at')
        
        # Apply status filter
        if status != 'all':
            if status == 'discussion':
                questions = questions.filter(type=QuestionType.DISCUSSION.value)
            else:
                questions = questions.filter(type=QuestionType.QUESTION.value)
                questions = questions.filter(answered=(status == 'answered'))
            
        # Apply language filter
        if language != 'all':
            questions = questions.filter(language__istartswith=language)
            if not questions.exists():
                questions = Question.objects.filter(tags__contains=[language.title()])
                if not questions.exists():
                    questions = Question.objects.filter(tags__contains=[language.lower()])           
                if not questions.exists():
                    questions = Question.objects.filter(tags__contains=[language.upper()])

        # Apply tags filter 
        if tags:
            lowercase_tags = [tag.lower() for tag in tags]
            questions = questions.filter(tags__iregex=r'(?i)' + '|'.join(lowercase_tags))

        # Apply date filters only 
        if start_date and start_date != "":
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d')
                questions = questions.filter(created_at__date__gte=start_date)
            except ValueError:
                print("Invalid date format for start_date")
                pass 
                
        if end_date and end_date != "":
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d')
                # Add one day to include the end date fully
                end_date = end_date + timedelta(days=1)
                questions = questions.filter(created_at__date__lt=end_date)
            except ValueError:
                print("Invalid date format for end_date")
                pass 

        offset = (page_number - 1) * 10

        total_count = questions.count()
        total_pages = (total_count + 9) // 10

        # Apply pagination
        questions = questions[offset:offset + 10]

        questions_data = [{
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
            'is_bookmarked': user.bookmarks.filter(pk=q.pk).exists(),
            'created_at' : q.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'post_type': q.type
        } for q in questions]
        
        return JsonResponse({'questions': questions_data, 'total_pages': total_pages}, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@swagger_auto_schema(
    tags=['Question'],
    method='get',
    operation_summary="Check Bookmark Status",
    operation_description="Check if a specific question is bookmarked by the user",
    manual_parameters=[
        openapi.Parameter(
            name='User-ID',
            in_=openapi.IN_HEADER,
            type=openapi.TYPE_INTEGER,
            description="ID of the user checking bookmark status",
            required=True
        ),
        openapi.Parameter(
            name='question_id',
            in_=openapi.IN_PATH,
            type=openapi.TYPE_INTEGER,
            description="ID of the question to check bookmark status",
            required=True
        )
    ],
    responses={
        200: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'is_bookmarked': openapi.Schema(
                    type=openapi.TYPE_BOOLEAN,
                    description="True if the question is bookmarked by the user, False otherwise"
                )
            }
        ),
        400: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Error message when user ID is missing or invalid"
                )
            }
        ),
        404: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Error message when question is not found"
                )
            }
        )
    }
)
@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def check_bookmark(request, question_id):
    """
    Check if a question is bookmarked by the user.
    Args:
        request (HttpRequest): The HTTP request object containing the User-ID in headers.
        question_id (int): The ID of the question to check for bookmark.
    Returns:
        HttpResponse: A JSON response indicating whether the question is bookmarked by the user.
    """
    user_id = request.headers.get('User-ID', None)
    if user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)

    user_id = int(user_id)

    if not user_id:
        return JsonResponse({'error': 'User ID parameter is required'}, status=400)

    user = User.objects.get(pk=user_id)
    question = Question.objects.get(_id=question_id)

    is_bookmarked = user.bookmarks.filter(pk=question_id).exists()

    return JsonResponse({'is_bookmarked': is_bookmarked}, status=200)

def get_most_popular_tags():
    questions = Question.objects.values_list('tags', flat=True)
    all_tags = list(chain.from_iterable(questions))
    tag_counts = Counter(all_tags)
    
    # Sort by count (descending) and get top 5
    most_common_tags = sorted(
        tag_counts.items(),
        key=lambda x: (-x[1], x[0])  
    )[:5]
    
    # Return just the tags (without counts)
    return [tag for tag, count in most_common_tags]
