from ..models import Question, Comment, UserType, User
from django.contrib.auth import login, authenticate, get_user_model
from django.http import HttpRequest, HttpResponse, JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from ..Utils.utils import *
from ..Utils.forms import *



@csrf_exempt  # This is allowing POST requests without CSRF token
def create_comment(request: HttpRequest) -> HttpResponse:
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            question_id = data.get('question_id')
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
                language_id=language_id,
                author=request.user  # Associate the comment with the logged-in user
            )

            # Associate the comment with the question
            question.add_comment(comment)

            return JsonResponse({'success': 'Comment created successfully', 'comment_id': comment._id}, status=201)

        except (KeyError, json.JSONDecodeError) as e:
            return JsonResponse({'error': f'Malformed data: {str(e)}'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


#TODO: Implement edit_comment and delete_comment views
@csrf_exempt
def edit_comment(request: HttpRequest, comment_id:int) -> HttpResponse:
    if not comment_id:
        return JsonResponse({'error': 'Comment ID parameter is required'}, status=400)
    
    user_id = request.user.id
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
def delete_comment(request: HttpRequest) -> HttpResponse:
    raise NotImplementedError("Delete comment functionality is not implemented yet.")