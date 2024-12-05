from ..models import Question, Comment, UserType, User, Annotation
from django.http import HttpRequest, HttpResponse, JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from ..Utils.utils import *
from ..Utils.forms import *
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny


@swagger_auto_schema(
    tags=['Annotation'],
    method='post',
    operation_summary="Create Annotation",
    operation_description="Create a new annotation with optional parent annotation support",
    manual_parameters=[
        openapi.Parameter(
            name='User-ID',
            in_=openapi.IN_HEADER,
            type=openapi.TYPE_INTEGER,
            description="ID of the user creating the annotation",
            required=True
        ),
    ],
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['text'],
        properties={
            'text': openapi.Schema(type=openapi.TYPE_STRING, description="The text the person wants to annotate to look after"),
            'language_qid': openapi.Schema(type=openapi.TYPE_INTEGER, description="Language QID to fetch when the specified language is searched", default=0),
            'annotation_starting_point': openapi.Schema(type=openapi.TYPE_INTEGER, description="Annotation starting point in the text", default=0),
            'annotation_ending_point': openapi.Schema(type=openapi.TYPE_INTEGER, description="Annotation ending point in the text", default=0),
            'type': openapi.Schema(type=openapi.TYPE_STRING, description="Type of annotation to decide main annnoation or annotation comment(optional, use 'annotation_child' for child annotations)"),
            'parent_id': openapi.Schema(type=openapi.TYPE_INTEGER, description="Parent annotation ID (required if type is 'annotation_child')")
        }
    ),
    responses={
        201: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'success': openapi.Schema(type=openapi.TYPE_STRING, description="Success message"),
                'annotation_id': openapi.Schema(type=openapi.TYPE_INTEGER, description="ID of the created annotation"),
                'parent_id': openapi.Schema(type=openapi.TYPE_INTEGER, description="ID of the parent annotation (if applicable)", nullable=True)
            }
        ),
        400: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(type=openapi.TYPE_STRING, description="Error message")
            }
        ),
        404: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(type=openapi.TYPE_STRING, description="Error message")
            }
        ),
        405: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(type=openapi.TYPE_STRING, description="Invalid request method error")
            }
        )
    }
)
@api_view(['POST']) 
@permission_classes([AllowAny])
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

@swagger_auto_schema(
    tags=['Annotation'],

    method='delete',
    operation_summary="Delete Annotation",
    operation_description="Delete an annotation. Only the author of the annotation can delete the annotation.",
    manual_parameters=[
        openapi.Parameter(
            name='User-ID',
            in_=openapi.IN_HEADER,
            type=openapi.TYPE_INTEGER,
            description="ID of the user attempting to delete the annotation",
            required=True
        ),
        openapi.Parameter(
            name='annotation_id',
            in_=openapi.IN_PATH,
            type=openapi.TYPE_INTEGER,
            description="ID of the annotation to be deleted",
            required=True
        )
    ],
    responses={
        200: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'success': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Success message",
                    example="Annotation deleted successfully"
                )
            }
        ),
        400: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Bad request error message"
                )
            }
        ),
        403: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Permission denied error message",
                    example="Permission denied: You are not the author of this annotation"
                )
            }
        ),
        404: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Not found error message",
                    example="Annotation not found"
                )
            }
        ),
        405: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'error': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Method not allowed error message",
                    example="Invalid request method"
                )
            }
        )
    }
)
@api_view(['DELETE'])
@permission_classes([AllowAny])
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


@swagger_auto_schema(
    tags=['Annotation'],
   method='put',
   operation_summary="Edit Annotation",
   operation_description="Edit an existing annotation. Only the author of the annotation can edit it.",
   manual_parameters=[
       openapi.Parameter(
           name='User-ID', 
           in_=openapi.IN_HEADER,
           type=openapi.TYPE_INTEGER,
           description="ID of the user attempting to edit the annotation",
           required=True
       ),
       openapi.Parameter(
           name='annotation_id',
           in_=openapi.IN_PATH, 
           type=openapi.TYPE_INTEGER,
           description="ID of the annotation to be edited",
           required=True
       )
   ],
   request_body=openapi.Schema(
       type=openapi.TYPE_OBJECT,
       properties={
           'text': openapi.Schema(
               type=openapi.TYPE_STRING,
               description="Updated annotation text"
           ),
           'language_qid': openapi.Schema(
               type=openapi.TYPE_INTEGER,
               description="Updated language QID for the annotation"
           ),
           'annotation_starting_point': openapi.Schema(
               type=openapi.TYPE_INTEGER,
               description="Updated starting point of the annotation"
           ),
           'annotation_ending_point': openapi.Schema(
               type=openapi.TYPE_INTEGER,
               description="Updated ending point of the annotation"
           )
       }
   ),
   responses={
       200: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'success': openapi.Schema(
                   type=openapi.TYPE_STRING,
                   description="Success message",
                   example="Annotation updated successfully"
               ),
               'annotation_id': openapi.Schema(
                   type=openapi.TYPE_INTEGER,
                   description="ID of the updated annotation"
               )
           }
       ),
       400: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(
                   type=openapi.TYPE_STRING,
                   description="Bad request error message",
                   example="Invalid JSON"
               )
           }
       ),
       403: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(
                   type=openapi.TYPE_STRING,
                   description="Permission denied error message",
                   example="Permission denied: You are not the author of this annotation"
               )
           }
       ),
       404: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(
                   type=openapi.TYPE_STRING,
                   description="Not found error message",
                   example="Annotation not found"
               )
           }
       ),
       405: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(
                   type=openapi.TYPE_STRING,
                   description="Method not allowed error message",
                   example="Invalid request method"
               )
           }
       )
   }
)
@api_view(['PUT'])
@permission_classes([AllowAny])
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

@swagger_auto_schema(
    tags=['Annotation'],
   method='get',
   operation_summary="Get Annotations by Language",
   operation_description="Retrieve all annotations for a specific language, including their child annotations",
   manual_parameters=[
       openapi.Parameter(
           name='language_qid',
           in_=openapi.IN_PATH,
           type=openapi.TYPE_INTEGER,
           description="Language QID to filter annotations",
           required=True
       )
   ],
   responses={
       200: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'success': openapi.Schema(
                   type=openapi.TYPE_STRING,
                   description="Success message"
               ),
               'data': openapi.Schema(
                   type=openapi.TYPE_ARRAY,
                   items=openapi.Schema(
                       type=openapi.TYPE_OBJECT,
                       properties={
                           'annotation_id': openapi.Schema(
                               type=openapi.TYPE_INTEGER,
                               description="ID of the annotation"
                           ),
                           'text': openapi.Schema(
                               type=openapi.TYPE_STRING,
                               description="Annotation text"
                           ),
                           'language_qid': openapi.Schema(
                               type=openapi.TYPE_INTEGER,
                               description="Language QID of the annotation"
                           ),
                           'annotation_starting_point': openapi.Schema(
                               type=openapi.TYPE_INTEGER,
                               description="Starting point of the annotation"
                           ),
                           'annotation_ending_point': openapi.Schema(
                               type=openapi.TYPE_INTEGER,
                               description="Ending point of the annotation"
                           ),
                           'annotation_date': openapi.Schema(
                               type=openapi.TYPE_STRING,
                               format='date-time',
                               description="Date when the annotation was created"
                           ),
                           'author_id': openapi.Schema(
                               type=openapi.TYPE_INTEGER,
                               description="ID of the annotation author"
                           ),
                           'parent_id': openapi.Schema(
                               type=openapi.TYPE_INTEGER,
                               description="ID of the parent annotation if exists",
                               nullable=True
                           ),
                           'child_annotations': openapi.Schema(
                               type=openapi.TYPE_ARRAY,
                               items=openapi.Schema(
                                   type=openapi.TYPE_OBJECT,
                                   properties={
                                       'annotation_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                       'text': openapi.Schema(type=openapi.TYPE_STRING),
                                       'language_qid': openapi.Schema(type=openapi.TYPE_INTEGER),
                                       'annotation_starting_point': openapi.Schema(type=openapi.TYPE_INTEGER),
                                       'annotation_ending_point': openapi.Schema(type=openapi.TYPE_INTEGER),
                                       'annotation_date': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
                                       'author_id': openapi.Schema(type=openapi.TYPE_INTEGER)
                                   }
                               ),
                               description="List of child annotations"
                           )
                       }
                   )
               )
           }
       ),
       404: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(
                   type=openapi.TYPE_STRING,
                   description="Not found error message",
                   example="No annotations found for the given language_qid"
               )
           }
       ),
       400: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(
                   type=openapi.TYPE_STRING,
                   description="Error message for bad requests"
               )
           }
       ),
       405: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(
                   type=openapi.TYPE_STRING,
                   description="Method not allowed error message",
                   example="Invalid request method"
               )
           }
       )
   }
)
@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def get_annotations_by_language_request(request, language_qid):
    if request.method == 'GET':
        try:
            # Fetch all annotations with the given language_qid
            annotations_data = get_annotations_by_language(language_qid)

            return JsonResponse({'success': 'Annotations retrieved', 'data': annotations_data}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)


def get_annotations_by_language(language_qid):
    annotations = Annotation.objects.filter(language_qid=language_qid)

    if not annotations.exists():
        return []

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

    
    return annotations_data

@swagger_auto_schema(
    tags=['Annotation'],
   method='get',
   operation_summary="Get All Annotations",
   operation_description="Retrieve all annotations in the system, including their child annotations",
   responses={
       200: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'success': openapi.Schema(
                   type=openapi.TYPE_STRING,
                   description="Success message"
               ),
               'data': openapi.Schema(
                   type=openapi.TYPE_ARRAY,
                   items=openapi.Schema(
                       type=openapi.TYPE_OBJECT,
                       properties={
                           'annotation_id': openapi.Schema(
                               type=openapi.TYPE_INTEGER,
                               description="ID of the annotation"
                           ),
                           'text': openapi.Schema(
                               type=openapi.TYPE_STRING,
                               description="Annotation text"
                           ),
                           'language_qid': openapi.Schema(
                               type=openapi.TYPE_INTEGER,
                               description="Language QID of the annotation"
                           ),
                           'annotation_starting_point': openapi.Schema(
                               type=openapi.TYPE_INTEGER,
                               description="Starting point of the annotation"
                           ),
                           'annotation_ending_point': openapi.Schema(
                               type=openapi.TYPE_INTEGER,
                               description="Ending point of the annotation"
                           ),
                           'annotation_date': openapi.Schema(
                               type=openapi.TYPE_STRING,
                               format='date-time',
                               description="Date when the annotation was created"
                           ),
                           'author_id': openapi.Schema(
                               type=openapi.TYPE_INTEGER,
                               description="ID of the annotation author"
                           ),
                           'parent_id': openapi.Schema(
                               type=openapi.TYPE_INTEGER,
                               description="ID of the parent annotation if exists",
                               nullable=True
                           ),
                           'child_annotations': openapi.Schema(
                               type=openapi.TYPE_ARRAY,
                               items=openapi.Schema(
                                   type=openapi.TYPE_OBJECT,
                                   properties={
                                       'annotation_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                                       'text': openapi.Schema(type=openapi.TYPE_STRING),
                                       'language_qid': openapi.Schema(type=openapi.TYPE_INTEGER),
                                       'annotation_starting_point': openapi.Schema(type=openapi.TYPE_INTEGER),
                                       'annotation_ending_point': openapi.Schema(type=openapi.TYPE_INTEGER),
                                       'annotation_date': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
                                       'author_id': openapi.Schema(type=openapi.TYPE_INTEGER)
                                   }
                               ),
                               description="List of child annotations"
                           )
                       }
                   )
               )
           }
       ),
       404: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(
                   type=openapi.TYPE_STRING,
                   description="Not found error message",
                   example="No annotations found"
               )
           }
       ),
       400: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(
                   type=openapi.TYPE_STRING,
                   description="Error message for bad requests"
               )
           }
       ),
       405: openapi.Schema(
           type=openapi.TYPE_OBJECT,
           properties={
               'error': openapi.Schema(
                   type=openapi.TYPE_STRING,
                   description="Method not allowed error message",
                   example="Invalid request method"
               )
           }
       )
   }
)
@api_view(['GET'])
@permission_classes([AllowAny])
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
                    "author_name": annotation.author.username,
                    'parent_id': annotation.parent_annotation._id if annotation.parent_annotation else None,
                    'child_annotations': [
                        {
                            'annotation_id': child._id,
                            'text': child.text,
                            'language_qid': child.language_qid,
                            'annotation_starting_point': child.annotation_starting_point,
                            'annotation_ending_point': child.annotation_ending_point,
                            'annotation_date': child.annotation_date,
                            'author_id': child.author.user_id,
                            "author_name": child.author.username
                        } for child in annotation.child_annotations.all()
                    ]
                }
                annotations_data.append(annotation_data)

            return JsonResponse({'success': 'Annotations retrieved', 'data': annotations_data}, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)
