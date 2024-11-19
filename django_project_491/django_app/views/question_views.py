from ..models import Question, Comment, UserType, User, VoteType
from django.http import HttpRequest, HttpResponse, JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from django.core.cache import cache
from datetime import datetime
from django.utils import timezone
from ..Utils.utils import *
from ..Utils.forms import *
from typing import List


def get_question_details(request: HttpRequest, question_id: int) -> HttpResponse:
    try:
        question: Question = Question.objects.prefetch_related('comments', 'reported_by', 'votes__user').get(
            _id=question_id)

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
            'topic': question.topic,
            'reported_by': [user.username for user in question.reported_by.all()],
            'upvoted_by': [vote.user.username for vote in question.votes.filter(vote_type=VoteType.UPVOTE.value)],
            'downvoted_by': [vote.user.username for vote in question.votes.filter(vote_type=VoteType.DOWNVOTE.value)]
        }

        return JsonResponse({'question': question_data}, status=200)

    except Question.DoesNotExist:
        return JsonResponse({'error': 'Question not found'}, status=404)


@csrf_exempt
def get_question_comments(request, question_id):
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
            'answer_of_the_question': comment.answer_of_the_question,
            'upvoted_by': [vote.user.username for vote in comment.votes.filter(vote_type=VoteType.UPVOTE.value)],
            'downvoted_by': [vote.user.username for vote in comment.votes.filter(vote_type=VoteType.DOWNVOTE.value)]
        } for comment in comments]

        return JsonResponse({'comments': comments_data}, status=200)

    except Question.DoesNotExist:
        return JsonResponse({'error': 'Question not found'}, status=404)


@csrf_exempt
def create_question(request: HttpRequest, user_id) -> HttpResponse:
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            title = data.get('title')
            language = data.get('language')
            details = data.get('details')
            code_snippet = data.get('code_snippet', '')  # There may not be a code snippet
            tags = data.get('tags', [])  # There may not be any tags

            user = User.objects.get(pk=user_id)
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
                author=user
            )

            user.questions.add(question)

            return JsonResponse({'success': 'Question created successfully', 'question_id': question._id}, status=201)

        except (KeyError, json.JSONDecodeError) as e:
            return JsonResponse({'error': f'Malformed data: {str(e)}'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def edit_question(request: HttpRequest, question_id: int) -> HttpResponse:
    if not question_id:
        return JsonResponse({'error': 'Comment ID parameter is required'}, status=400)

    user_id = request.headers.get('User-ID', None)
    if user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)

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


@csrf_exempt
def delete_question(request: HttpRequest, question_id: int) -> HttpResponse:
    if not question_id:
        return JsonResponse({'error': 'Comment ID parameter is required'}, status=400)

    user_id = request.headers.get('User-ID', None)
    if user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)

    if not user_id:
        return JsonResponse({'error': 'User ID parameter is required'}, status=400)

    deletor_user = User.objects.get(pk=user_id)

    try:
        question = Question.objects.get(_id=question_id)
        question_owner_user_id = question.author.id

        if deletor_user.id != question_owner_user_id and deletor_user.userType != UserType.ADMIN:
            return JsonResponse({'error': 'Only admins and owner of the questions can delete questions'}, status=403)

        question.delete()

        user = request.user
        user.questions.remove(question)

    except Question.DoesNotExist:
        return JsonResponse({'error': 'Question not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)


@csrf_exempt
def mark_as_answered(request, question_id: int) -> HttpResponse:
    if not question_id:
        return JsonResponse({'error': 'Question ID parameter is required'}, status=400)

    request_user_id = request.headers.get('User-ID', None)
    if request_user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)

    question = Question.objects.get(_id=question_id)
    author: User = question.author
    if author.user_id != request_user_id:
        return JsonResponse({'error': 'Only the owner of the question can mark it as answered'}, status=403)

    question.mark_as_answered()

    return JsonResponse({'success': 'Question marked as answered successfully'}, status=200)


# TODO: FIND OUT WHAT TO DO WITH REPORTED QUESTIONS
@csrf_exempt
def report_question(request, question_id: int) -> HttpResponse:
    if not question_id:
        return JsonResponse({'error': 'Question ID parameter is required'}, status=400)

    question = Question.objects.get(_id=question_id)

    user_id = request.headers.get('User-ID', None)
    if user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)

    if not user_id:
        return JsonResponse({'error': 'User ID parameter is required'}, status=400)

    reporter_user = User.objects.get(pk=user_id)

    question.reported_by.add(reporter_user)
    question.save()

    return JsonResponse({'success': 'Question reported successfully'}, status=200)


@csrf_exempt
def list_questions_by_language(request, language: str, page_number=1) -> HttpResponse:
    if not language:
        return JsonResponse({'error': 'Language parameter is required'}, status=400)

    questions = Question.objects.filter(language__iexact=language)[10 * (page_number - 1): 10 * page_number]

    questions_data = [{
        'id': question._id,
        'title': question.title,
        'language': question.language,
        'tags': question.tags,
        'details': question.details,
        'code_snippet': question.code_snippet,
        'likes': question.upvotes,
        'creationDate': question.created_at .strftime('%Y-%m-%d %H:%M:%S'),
    } for question in questions]

    return JsonResponse({'questions': questions_data}, safe=False, status=200)


@csrf_exempt
def list_questions_by_tags(request, tags: str, page_number=1) -> HttpResponse:
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
    print(questions_data)
    return JsonResponse({'questions': questions_data}, safe=False)


@csrf_exempt
def question_of_the_day(request):
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
            'likes': question.upvotes,
            'comments_count': question.comments.count(),
            'programmingLanguage': question.language,
            'codeSnippet': question.code_snippet,
            'tags': question.tags,
            'answered': question.answered,
            'topic': question.topic
        }

        today = timezone.localdate()  # This gives you a timezone-aware date object
        midnight = datetime.combine(today, datetime.min.time(), tzinfo=timezone.get_current_timezone())
        seconds_until_midnight = (midnight + timezone.timedelta(days=1) - timezone.now()).seconds
        cache.set(cache_key, question_data, timeout=seconds_until_midnight)

    return JsonResponse({'question': question_data}, safe=False)


@csrf_exempt
def list_questions_according_to_the_user(request, user_id: int):
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
        'topic': question.topic,
        'author': question.author.username
    } for question in personalized_questions]
    return JsonResponse({'questions': questions_data}, safe=False)
