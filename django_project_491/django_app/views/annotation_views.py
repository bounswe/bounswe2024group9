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

@csrf_exempt
def delete_annotation(request, annotation_id):
    if request.method == 'DELETE':
        try:
            # Validate User ID from header
            user_id = request.headers.get('User-ID', None)
            if user_id is None:
                return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)
            user_id = int(user_id)
            user = User.objects.get(pk=user_id)

            # Fetch the annotation
            try:
                annotation = Annotation.objects.get(pk=annotation_id)
            except Annotation.DoesNotExist:
                return JsonResponse({'error': 'Annotation not found'}, status=404)

            # Check if the user is the author of the annotation
            if annotation.author != user:
                return JsonResponse({'error': 'Permission denied: You are not the author of this annotation'}, status=403)

            # Delete the annotation
            annotation.delete()
            return JsonResponse({'success': 'Annotation deleted successfully'}, status=200)

        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def edit_annotation(request, annotation_id):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)

            # Validate User ID from header
            user_id = request.headers.get('User-ID', None)
            if user_id is None:
                return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)
            user_id = int(user_id)
            user = User.objects.get(pk=user_id)

            # Fetch the annotation
            try:
                annotation = Annotation.objects.get(pk=annotation_id)
            except Annotation.DoesNotExist:
                return JsonResponse({'error': 'Annotation not found'}, status=404)

            # Check if the user is the author of the annotation
            if annotation.author != user:
                return JsonResponse({'error': 'Permission denied: You are not the author of this annotation'}, status=403)

            # Update the annotation fields
            annotation.text = data.get('text', annotation.text)
            annotation.language_qid = data.get('language_qid', annotation.language_qid)
            annotation.annotation_starting_point = data.get('annotation_starting_point', annotation.annotation_starting_point)
            annotation.annotation_ending_point = data.get('annotation_ending_point', annotation.annotation_ending_point)

            annotation.save()

            return JsonResponse({'success': 'Annotation updated successfully', 'annotation_id': annotation._id}, status=200)

        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def get_annotations_by_language(request, language_qid):
    if request.method == 'GET':
        try:
            # Fetch all annotations with the given language_qid
            annotations = Annotation.objects.filter(language_qid=language_qid)

            if not annotations.exists():
                return JsonResponse({'error': 'No annotations found for the given language_qid'}, status=404)

            # Structure the data
            annotations_data = []
            for annotation in annotations:
                annotation_data = {
                    'annotation_id': annotation._id,
                    'text': annotation.text,
                    'language_qid': annotation.language_qid,
                    'annotation_starting_point': annotation.annotation_starting_point,
                    'annotation_ending_point': annotation.annotation_ending_point,
                    'annotation_date': annotation.annotation_date,
                    'author_id': annotation.author.user_id,
                    'parent_id': annotation.parent_annotation._id if annotation.parent_annotation else None,
                    'child_annotations': [
                        {
                            'annotation_id': child._id,
                            'text': child.text,
                            'language_qid': child.language_qid,
                            'annotation_starting_point': child.annotation_starting_point,
                            'annotation_ending_point': child.annotation_ending_point,
                            'annotation_date': child.annotation_date,
                            'author_id': child.author.user_id
                        } for child in annotation.child_annotations.all()
                    ]
                }
                annotations_data.append(annotation_data)

            return JsonResponse({'success': 'Annotations retrieved', 'data': annotations_data}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def get_all_annotations(request):
    if request.method == 'GET':
        try:
            # Fetch all annotations
            annotations = Annotation.objects.all()

            if not annotations.exists():
                return JsonResponse({'error': 'No annotations found'}, status=404)

            # Structure the data
            annotations_data = []
            for annotation in annotations:
                annotation_data = {
                    'annotation_id': annotation._id,
                    'text': annotation.text,
                    'language_qid': annotation.language_qid,
                    'annotation_starting_point': annotation.annotation_starting_point,
                    'annotation_ending_point': annotation.annotation_ending_point,
                    'annotation_date': annotation.annotation_date,
                    'author_id': annotation.author.user_id,
                    'parent_id': annotation.parent_annotation._id if annotation.parent_annotation else None,
                    'child_annotations': [
                        {
                            'annotation_id': child._id,
                            'text': child.text,
                            'language_qid': child.language_qid,
                            'annotation_starting_point': child.annotation_starting_point,
                            'annotation_ending_point': child.annotation_ending_point,
                            'annotation_date': child.annotation_date,
                            'author_id': child.author.user_id
                        } for child in annotation.child_annotations.all()
                    ]
                }
                annotations_data.append(annotation_data)

            return JsonResponse({'success': 'Annotations retrieved', 'data': annotations_data}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)
