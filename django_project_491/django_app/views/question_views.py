from ..models import Question, Comment, UserType, User
from django.contrib.auth import login, authenticate, get_user_model
from django.http import HttpRequest, HttpResponse, JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from ..Utils.utils import *
from ..Utils.forms import *
from typing import List

def get_question(request: HttpRequest, question_id: int) -> HttpResponse:
    try:
        question = Question.objects.get(_id=question_id)
        question_data = {
            'id': question._id,
            'title': question.title,
            'language': question.language,
            'tags': question.tags,
            'details': question.details,
            'code_snippet': question.code_snippet,
            'upvotes': question.upvotes,
            'creationDate': question.creationDate.strftime('%Y-%m-%d %H:%M:%S'),
        }

        return JsonResponse({'question': question_data}, status=200)

    except Question.DoesNotExist:
        return JsonResponse({'error': 'Question not found'}, status=404)

@csrf_exempt
def get_question_comments(request, question_id):
    try:
        question = Question.objects.get(_id=question_id)
        comments : List[Comment] = question.comments.all()

        comments_data = [{
            'comment_id': comment._id,
            'details': comment.details,
            'user': comment.author.username,
            'upvotes': comment.upvotes,
        } for comment in comments]

        return JsonResponse({'comments': comments_data}, status=200)
    
    except Question.DoesNotExist:
        return JsonResponse({'error': 'Question not found'}, status=404)


@csrf_exempt  
def create_question(request : HttpRequest) -> HttpResponse:
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            title = data.get('title')
            language = data.get('language')
            details = data.get('details')
            code_snippet = data.get('code_snippet', '')  # There may not be a code snippet
            tags = data.get('tags', [])  # There may not be any tags

            Lang2ID = get_languages() 
            language_id = Lang2ID.get(language, None)

            if language_id is None:
                return JsonResponse({'error': 'Invalid language'}, status=400)
        
            question = Question.objects.create(
                title=title,
                language=language,
                language_id=language_id, 
                details=details,
                code_snippet=code_snippet,
                tags=tags,
                author=request.user
            )

            request.user.add_question(question)

            return JsonResponse({'success': 'Question created successfully', 'question_id': question._id}, status=201)

        except (KeyError, json.JSONDecodeError) as e:
            return JsonResponse({'error': f'Malformed data: {str(e)}'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def edit_question(request: HttpRequest, question_id: int) -> HttpResponse:
    if not question_id:
        return JsonResponse({'error': 'Comment ID parameter is required'}, status=400)
    
    user_id = request.user.id
    if not user_id:
        return JsonResponse({'error': 'User ID parameter is required'}, status=400)
    
    editor_user = User.objects.get(pk=user_id)

    try:
        question = Question.objects.get(_id=question_id)
        question_owner_user_id = question.author.id

        if editor_user.id != question_owner_user_id and editor_user.userType != UserType.ADMIN:
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

    except Question.DoesNotExist:
        return JsonResponse({'error': 'Question not found'}, status=404)


    except (KeyError, json.JSONDecodeError) as e:
        return JsonResponse({'error': f'Malformed data: {str(e)}'}, status=400)

    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)

def delete_question(request: HttpRequest, question_id: int) -> HttpResponse:
    if not question_id:
        return JsonResponse({'error': 'Comment ID parameter is required'}, status=400)
    
    user_id = request.user.id
    if not user_id:
        return JsonResponse({'error': 'User ID parameter is required'}, status=400)
    
    deletor_user = User.objects.get(pk=user_id)

    try:
        question = Question.objects.get(_id=question_id)
        question_owner_user_id = question.author.id

        if deletor_user.id != question_owner_user_id and deletor_user.userType != UserType.ADMIN:
            return JsonResponse({'error': 'Only admins and owner of the questions can delete questions'}, status=403)

        question.delete()

    except Question.DoesNotExist:
        return JsonResponse({'error': 'Question not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)


def report_question(request):
    question_id = request.GET.get('question_id', None)
    
    if not question_id:
        return JsonResponse({'error': 'Question ID parameter is required'}, status=400)
    
    question = Question.objects.get(_id=question_id)
    
    question.reported = True
    question.reported_count += 1
    question.save()
    
    return JsonResponse({'success': 'Question reported successfully'}, status=200)



def list_questions_by_language(request):
    language = request.GET.get('language', None)
    
    if not language:
        return JsonResponse({'error': 'Language parameter is required'}, status=400)
    
    questions = Question.objects.filter(language__iexact=language)
    
    questions_data = [{
        'id': question._id,
        'title': question.title,
        'language': question.language,
        'tags': question.tags,
        'details': question.details,
        'code_snippet': question.code_snippet,
        'upvotes': question.upvotes,
        'creationDate': question.creationDate.strftime('%Y-%m-%d %H:%M:%S'),
    } for question in questions]
    
    return JsonResponse({'questions': questions_data}, safe=False, status=200)

@csrf_exempt
def list_questions_by_tag(request):
    tags = request.GET.get('tag_array', None)
    
    if not tags:
        return JsonResponse({'error': 'Tag parameter is required'}, status=400)
    
    questions = Question.objects.filter(tags__contains=tags)

    questions_data = [{
        'id': question._id,
        'title': question.title,
        'language': question.language,
        'tags': question.tags,
        'details': question.details,
        'code_snippet': question.code_snippet,
        'upvotes': question.upvotes,
        'creationDate': question.creationDate.strftime('%Y-%m-%d %H:%M:%S'),
    } for question in questions]

    return JsonResponse({'questions': questions_data}, safe=False, status=200)


def list_questions_by_hotness(request, page_number = 1):
    questions = Question.objects.order_by('-upvotes')[10 * (page_number - 1): 10 * page_number]
    
    questions_data = [{
        'id': question._id,
        'title': question.title,
        'language': question.language,
        'tags': question.tags,
        'details': question.details,
        'code_snippet': question.code_snippet,
        'upvotes': question.upvotes,
        'creationDate': question.creationDate.strftime('%Y-%m-%d %H:%M:%S'),
    } for question in questions]

    return JsonResponse({'questions': questions_data}, safe=False, status=200)


@csrf_exempt
def random_questions(request):
    # Retrieve 5 random questions
    questions = Question.objects.order_by('?')[:5]

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
