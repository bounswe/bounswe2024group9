from ..models import Question, Comment, UserType, User
from django.http import HttpRequest, HttpResponse, JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from ..Utils.utils import *
from ..Utils.forms import *



@csrf_exempt
def create_comment(request: HttpRequest, question_id : int) -> HttpResponse:
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            comment_details = data.get('details')
            code_snippet = data.get('code_snippet', '')
            language = data.get('language')

            # Fetch the question by its _id (since your model uses _id as the primary key)
            try:
                question = Question.objects.get(_id=question_id)
            except Question.DoesNotExist:
                return JsonResponse({'error': 'Question not found'}, status=404)

            # Get the language ID mapping
            Lang2ID = get_languages()
            language_id = Lang2ID.get(language, None)

            if language_id is None:
                return JsonResponse({'error': 'Invalid language'}, status=400)

            # Create a new comment
            comment = Comment.objects.create(
                details=comment_details,
                code_snippet=code_snippet,
                language=language,
                language_id=language_id,
                author=request.user,  # Associate the comment with the logged-in user
                question=question # Associate the comment with the current question
            )

            user = request.user
            user.authored_comments.add(comment)


            return JsonResponse({'success': 'Comment created successfully', 'comment_id': comment._id}, status=201)

        except (KeyError, json.JSONDecodeError) as e:
            return JsonResponse({'error': f'Malformed data: {str(e)}'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def edit_comment(request: HttpRequest, comment_id:int) -> HttpResponse:
    if not comment_id:
        return JsonResponse({'error': 'Comment ID parameter is required'}, status=400)
    
    user_id = int(request.headers.get('User-ID', None))
    if user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)
    
    if not user_id:
        return JsonResponse({'error': 'User ID parameter is required'}, status=400)
    
    editor_user = User.objects.get(pk=user_id)

    try:
        comment = Comment.objects.get(_id=comment_id)
        comment_owner_user_id = comment.author.id

        if editor_user.id != comment_owner_user_id and editor_user.userType != UserType.ADMIN:
            return JsonResponse({'error': 'Only admins and owner of the comments can edit comments'}, status=403)

        
        data = json.loads(request.body)
    
        comment.details = data.get('details', comment.details)
        comment.code_snippet = data.get('code_snippet', comment.code_snippet)
        comment.language_id = data.get('language_id', comment.language_id)
        comment.save()

    except Comment.DoesNotExist:
        return JsonResponse({'error': 'Comment not found'}, status=404)


    except (KeyError, json.JSONDecodeError) as e:
        return JsonResponse({'error': f'Malformed data: {str(e)}'}, status=400)


@csrf_exempt
def delete_comment(request: HttpRequest, comment_id : int) -> HttpResponse:
    if not comment_id:
        return JsonResponse({'error': 'Comment ID parameter is required'}, status=400)
    
    user_id = int(request.headers.get('User-ID', None))
    if user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)
    
    user = User.objects.get(pk=user_id)

    if not user_id:
        return JsonResponse({'error': 'User ID parameter is required'}, status=400)
    
    deletor_user = User.objects.get(pk=user_id)

    try:
        comment = Comment.objects.get(_id=comment_id)
        comment_owner_user_id = comment.author.id

        if deletor_user.id != comment_owner_user_id and deletor_user.userType != UserType.ADMIN:
            return JsonResponse({'error': 'Only admins and owner of the comments can delete comments'}, status=403)

        comment.delete()

        user.authored_comments.remove(comment)

    except Comment.DoesNotExist:
        return JsonResponse({'error': 'Comment not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)

@csrf_exempt
def mark_comment_as_answer(request: HttpRequest, comment_id : int) -> HttpResponse:
    """
    Marks a comment as the answer to a question. Only owner of the question and admin can mark a comment as the answer.
    Args:
        request (HttpRequest): The HTTP request object containing user information.
        comment_id (int): The ID of the comment to be marked as the answer.
    Returns:
        HttpResponse: A JSON response indicating the success or failure of the operation.
    Raises:
        JsonResponse: If the comment ID is not provided, if the comment does not exist,
                        if the user is not the author of the question, or if any other error occurs.
    Responses:
        200: Comment successfully marked as the answer.
        400: Comment ID parameter is required.
        403: Only the author of the question can mark a comment as the answer.
        404: Comment not found.
        500: An error occurred during the operation.
    """
    
    if not comment_id:
        return JsonResponse({'error': 'Comment ID parameter is required'}, status=400)

    try:
        comment = Comment.objects.get(_id=comment_id)
        question : Question = Comment.question
        user_id = int(request.headers.get('User-ID', None))
        if user_id is None:
            return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)
        user = User.objects.get(pk=user_id)

        if user != question.author and user.userType != UserType.ADMIN:
            return JsonResponse({'error': 'Only the author of the question can mark a comment as the answer'}, status=403)

        comment.answer_of_the_question = True
        comment.save()

        question.mark_as_answered(comment_id)
        
        question.save()

        return JsonResponse({'success': f'Comment {comment_id} marked as the answer for question {question._id}'}, status=200)

    except Comment.DoesNotExist:
        return JsonResponse({'error': 'Comment not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)
