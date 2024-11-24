from ..models import Question, Comment, UserType, User
from django.http import HttpRequest, HttpResponse, JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from ..Utils.utils import *
from ..Utils.forms import *



@csrf_exempt
def create_comment(request: HttpRequest, question_id: int) -> HttpResponse:
    """
    Handle the creation of a new comment for a specific question.

    Args:
        request (HttpRequest): The HTTP request object containing the POST data.
        question_id (int): The ID of the question to which the comment will be associated.

    Returns:
        HttpResponse: A JSON response indicating the success or failure of the comment creation process.

    Raises:
        JsonResponse: Returns a JSON response with an error message and appropriate HTTP status code in case of:
            - Question not found (404)
            - Invalid language (400)
            - Malformed data (400)
            - Invalid request method (405)
    """
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
            
            user_id = request.headers.get('User-ID', None)
            if user_id is None:
                return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)

            user_id = int(user_id)
            user = User.objects.get(pk=user_id)


            # Create a new comment
            comment = Comment.objects.create(
                details=comment_details,
                code_snippet=code_snippet,
                language=language,
                language_id=language_id,
                author=user,  # Associate the comment with the logged-in user
                question=question # Associate the comment with the current question
            )

            user = user
            user.authored_comments.add(comment)


            return JsonResponse({'success': 'Comment created successfully', 'comment_id': comment._id}, status=201)

        except (KeyError, json.JSONDecodeError) as e:
            return JsonResponse({'error': f'Malformed data: {str(e)}'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def edit_comment(request: HttpRequest, comment_id: int) -> HttpResponse:
    """
    Edit an existing comment.
    Args:
        request (HttpRequest): The HTTP request object containing headers and body data.
        comment_id (int): The ID of the comment to be edited.
    Returns:
        HttpResponse: A JSON response indicating the result of the operation.
    Raises:
        JsonResponse: Various JSON responses with appropriate status codes:
            - 400 if the comment ID or user ID is missing or malformed data is provided.
            - 403 if the user is not authorized to edit the comment.
            - 404 if the comment does not exist.
    """
    if not comment_id:
        return JsonResponse({'error': 'Comment ID parameter is required'}, status=400)
    
    user_id = request.headers.get('User-ID', None)
    if user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)

    user_id = int(user_id)
    
    
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
def delete_comment(request: HttpRequest, comment_id: int) -> HttpResponse:
    """
    Deletes a comment with the given comment_id if the request is made by the comment owner or an admin.
    Args:
        request (HttpRequest): The HTTP request object containing headers and other request data.
        comment_id (int): The ID of the comment to be deleted.
    Returns:
        HttpResponse: A JSON response indicating the result of the delete operation.
            - 200 OK: If the comment is successfully deleted.
            - 400 Bad Request: If the comment_id or user_id is not provided.
            - 403 Forbidden: If the user is neither the owner of the comment nor an admin.
            - 404 Not Found: If the comment does not exist.
            - 500 Internal Server Error: If an unexpected error occurs during the delete operation.
    """
    if not comment_id:
        return JsonResponse({'error': 'Comment ID parameter is required'}, status=400)
    
    user_id = request.headers.get('User-ID', None)
    if user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)

    user_id = int(user_id)
    
    user = User.objects.get(pk=user_id)
    
    deletor_user = User.objects.get(pk=user_id)

    try:
        comment = Comment.objects.get(_id=comment_id)
        comment_owner_user_id = comment.author.user_id

        if deletor_user.user_id != comment_owner_user_id and deletor_user.userType != UserType.ADMIN:
            return JsonResponse({'error': 'Only admins and owner of the comments can delete comments'}, status=403)

        comment.delete()
        return JsonResponse({'success': 'Comment Deleted Successfully'}, status=200)

        #user.authored_comments.remove(comment)

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
        question : Question = comment.question
        user_id = request.headers.get('User-ID', None)
        if user_id is None:
            return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)

        user_id = int(user_id)
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
