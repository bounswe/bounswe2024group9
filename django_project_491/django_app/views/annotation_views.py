from ..models import Question, Comment, UserType, User, Annotation
from django.http import HttpRequest, HttpResponse, JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from ..Utils.utils import *
from ..Utils.forms import *

@csrf_exempt
def create_annotation(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            # Validate User ID
            user_id = request.headers.get('User-ID', None)
            if user_id is None:
                return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)
            user_id = int(user_id)
            user = User.objects.get(pk=user_id)

            # Create the annotation
            annotation = Annotation.objects.create(
                text=data.get('text'),
                language_qid=data.get('language_qid', 0),
                annotation_starting_point=data.get('annotation_starting_point', 0),
                annotation_ending_point=data.get('annotation_ending_point', 0),
                author=user,
            )

            # Handle child annotation
            if data.get('type') == 'annotation_child':
                parent_id = data.get('parent_id')
                if not parent_id:
                    return JsonResponse({'error': 'Parent ID is required for annotation_child'}, status=400)
                try:
                    parent = Annotation.objects.get(_id=parent_id)
                    annotation.parent_annotation = parent
                except Annotation.DoesNotExist:
                    return JsonResponse({'error': 'Parent annotation not found'}, status=404)

            # Save the annotation
            annotation.save()

            # Success response
            response = {
                'success': 'Annotation created',
                'annotation_id': annotation._id,
                'parent_id': annotation.parent_annotation._id if annotation.parent_annotation else None
            }
            return JsonResponse(response, status=201)

        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

# parent = {
#     "text": "This is a standalone annotation",
#     "language_qid": 24582,
#     "annotation_starting_point": 10,
#     "annotation_ending_point": 20,
#     "type": "annotation"
# }

# child = {
#     "text": "This is a child annotation",
#     "language_qid": 24583,
#     "annotation_starting_point": 15,
#     "annotation_ending_point": 25,
#     "type": "annotation_child",
#     "parent_id": 1
# }

