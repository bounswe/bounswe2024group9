from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from .models import Route, Node, User
from django.core import serializers
import json
import logging
from rest_framework.decorators import api_view
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

logger = logging.getLogger(__name__)

@swagger_auto_schema(
    method='get',
    operation_summary="List top 20 liked routes from the database",
    operation_description="List top 20 liked routes from our database together with their id, title, rating, user, etc.",
    manual_parameters=[],
    responses={
        200: 'Successful Response',
        400: 'Bad Request',
    }
)
@api_view(['GET'])
def route_list(request):
    routes = Route.objects.all().order_by('-likes')[:20]
    
    routes_list = [{
        'route_id': route.route_id,
        'title': route.title,
        'description': route.description,
        'photos': route.photos,
        'rating': route.rating,
        'likes': route.likes,
        'comments': route.comments,
        'saves': route.saves,
        'node_ids': route.node_ids,
        "node_names": route.node_names, # Added for the node names to be shown in the route list
        'duration': route.duration,
        'duration_between': route.duration_between,
        'mapView': route.mapView,
        'username': User.objects.get(user_id=route.user).username,
        "user_id" : route.user
    } for route in routes]
    return JsonResponse(routes_list, safe=False)

def route_detail(request, pk):
    route = get_object_or_404(Route, pk=pk)
    route_json = serializers.serialize('json', [route]) # Node is put in array because serialize expects a list
    route_data = json.loads(route_json)[0]  # Deserialize the JSON and take the first element
    return JsonResponse(route_data, safe=False)

def get_routes_by_qid(request, qid):
    try:
        routes = Route.objects.filter(node_ids__contains=qid)

        route_data = [{
            'route_id': route.route_id,
            'title': route.title,
            'description': route.description,
            'photos': route.photos,
            'rating': route.rating,
            'likes': route.likes,
            'comments': route.comments,
            'saves': route.saves,
            'duration': route.duration,
            'duration_between': route.duration_between,
            'mapView': route.mapView,
            'node_ids': route.node_ids,
            "node_names": route.node_names, # Added for the node names to be shown in the route list
            'username': User.objects.get(user_id=route.user).username,
            "user_id" : route.user
        } for route in routes]
        return JsonResponse(route_data, safe=False)
    except Exception as e:
        logger.error(f"Error retrieving routes by qid: {e}")
        return JsonResponse({'error': 'An error occurred while retrieving routes'}, status=500)

def node_list(request):
    nodes = Node.objects.all()
    nodes_list = serializers.serialize('json', nodes)
    nodes_list_json = json.loads(nodes_list)
    return JsonResponse(nodes_list_json, safe=False)

def node_detail(request, pk):
    node = get_object_or_404(Node, pk=pk)
    node_json = serializers.serialize('json', [node]) # Node is put in array because serialize expects a list
    node_data = json.loads(node_json)[0]  # Deserialize the JSON and take the first element
    return JsonResponse(node_data, safe=False)

def user_list(request):
    users = User.objects.all()
    users_list = serializers.serialize('json', users)
    return JsonResponse(users_list, safe=False)

def user_detail(request, pk):
    user = get_object_or_404(User, pk=pk)
    user_json = serializers.serialize('json', [user]) # User is put in array because serialize expects a list
    user_data = json.loads(user_json)[0]  # Deserialize the JSON and take the first element
    return JsonResponse(user_data, safe=False)

@csrf_exempt
@swagger_auto_schema(
    method='post',
    operation_summary="Create a new user",
    operation_description="Create a new user with the provided username, email, and password.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'username': openapi.Schema(type=openapi.TYPE_STRING, description='Username of the new user'),
            'email': openapi.Schema(type=openapi.TYPE_STRING, description='Email of the new user'),
            'password': openapi.Schema(type=openapi.TYPE_STRING, description='Password of the new user'),
        },
        required=['username', 'email', 'password'],
    ),
    responses={
        200: 'User created successfully',
        400: 'Bad Request'
    }
)
@api_view(['POST'])
def create_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        e_mail = data.get('email')
        password = data.get('password')
        # is_superuser = data.get('is_superuser', False) # Everybody will be regular user

        if not username or not password or not e_mail:
            return JsonResponse({'error': 'Username, e-mail, and password are required.'}, status=400)

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists.'}, status=400)
        if User.objects.filter(e_mail=e_mail).exists():
            return JsonResponse({'error': 'E-mail already exists.'}, status=400)

        # Depending on your CustomUserManager, adjust the creation logic here
        user = User.objects.create_user(username=username, password=password, e_mail=e_mail)
        
        # Set additional fields if needed
        user.is_active = True
        user.save()

        return JsonResponse({
            'status': 'success', 
            'user_id': user.user_id,
            'username': user.username,
            'e_mail': user.e_mail,
            'is_active': user.is_active,
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff
        })
    else:
        return HttpResponse(status=405)

@csrf_exempt
@swagger_auto_schema(
    method='post',
    operation_summary="Create a new node",
    operation_description="Create a new node with the provided name, latitude, longitude, and photo.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'name': openapi.Schema(type=openapi.TYPE_STRING, description='Name of the new node'),
            'latitude': openapi.Schema(type=openapi.TYPE_STRING, description='Latitude of the node'),
            'longitude': openapi.Schema(type=openapi.TYPE_STRING, description='Longitude of the node'),
            'photo': openapi.Schema(type=openapi.TYPE_FILE, description='Photo of the node'),
        },
        required=['name', 'latitude', 'longitude'],
    ),
    responses={
        200: 'Node created successfully',
        405: 'Method Not Allowed'
    }
)
@api_view(['POST'])
def create_node(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')
        photo = request.FILES.get('photo')

        # Validation checks and additional logic goes here
        node = Node.objects.create(
            name=name,
            photo=photo,
            latitude=latitude,
            longitude=longitude
        )

        return JsonResponse({'status': 'success', 'node_id': node.pk})
    else:
        return HttpResponse(status=405)
    
@csrf_exempt
@swagger_auto_schema(
    method='post',
    operation_summary="Create a new route",
    operation_description="Create a new route with the provided title, description, photos, rating, likes, comments, saves, node IDs, node names, map view, and user ID.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'title': openapi.Schema(type=openapi.TYPE_STRING, description='Title of the new route'),
            'description': openapi.Schema(type=openapi.TYPE_STRING, description='Description of the route'),
            'photos': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_STRING), description='Photos of the route'),
            'rating': openapi.Schema(type=openapi.TYPE_NUMBER, description='Rating of the route'),
            'likes': openapi.Schema(type=openapi.TYPE_NUMBER, description='Likes count of the route'),
            'comments': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_STRING), description='Comments on the route'),
            'saves': openapi.Schema(type=openapi.TYPE_NUMBER, description='Saves count of the route'),
            'node_ids': openapi.Schema(type=openapi.TYPE_STRING, description='Node IDs associated with the route'),
            'node_names': openapi.Schema(type=openapi.TYPE_STRING, description='Node names associated with the route'),
            'mapView': openapi.Schema(type=openapi.TYPE_STRING, description='Map view of the route'),
            'user': openapi.Schema(type=openapi.TYPE_STRING, description='User ID of the route creator'),
        },
        required=['title', 'description', 'user'],
    ),
    responses={
        200: 'Route created successfully',
        400: 'Bad Request',
        405: 'Method Not Allowed'
    }
)
@api_view(['POST'])
def create_route(request):
    if request.method == 'POST':
        try:
            if request.POST: # Checking if the request contains form data
                data = request.POST
            else: # If not, it should contain JSON data
                data = json.loads(request.body.decode('utf-8')) 

            title = data.get('title')
            description = data.get('description')
            photos = data.get('photos', [])
            rating = data.get('rating', 0)
            likes = data.get('likes', 0)
            comments = data.get('comments', [])
            saves = data.get('saves', 0)
            duration = data.get('duration', [])
            duration_between = data.get('duration_between', [])
            mapView = data.get('mapView')
            node_ids = data.get('node_ids', '')  # List of node IDs as string
            node_names = data.get('node_names', '')  # List of node names as string
            user_id = data.get('user', None)
            

            route = Route.objects.create(
                title=title,
                description=description,
                photos=photos,
                rating=rating,
                likes=likes,
                comments=comments,
                saves=saves,
                node_ids=node_ids,  # Stored as a comma-separated string
                node_names=node_names,  # Stored as a comma-separated string
                # duration=duration, # Commented because it is not used and if it will be sued it must be an array dont send string
                # duration_between=duration_between,
                mapView=mapView,
                user=user_id
            )

            return JsonResponse({'status': 'success', 'route_id': route.pk})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)


    else:
        return HttpResponse(status=405)

@csrf_exempt
@swagger_auto_schema(
    method='post',
    operation_summary="Delete a route",
    operation_description="Delete a specific route by its ID.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'routeId': openapi.Schema(type=openapi.TYPE_STRING, description='ID of the route to delete'),
        },
        required=['routeId'],
    ),
    responses={
        200: 'Route deleted successfully',
        400: 'Error deleting route',
        405: 'Method Not Allowed'
    }
)
@api_view(['POST'])
def delete_route(request):
    if request.method == 'POST':
        try:
            route_id = request.POST.get('routeId')
            route = get_object_or_404(Route, pk=route_id)
            route.delete()
            return JsonResponse({'status': 'success', 'message': 'Route deleted successfully'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    else:
        return HttpResponse(status=405)

@csrf_exempt
@swagger_auto_schema(
    method='post',
    operation_summary="Log in a user",
    operation_description="Authenticate a user with the provided username and password.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'username': openapi.Schema(type=openapi.TYPE_STRING, description='Username of the user'),
            'password': openapi.Schema(type=openapi.TYPE_STRING, description='Password of the user'),
        },
        required=['username', 'password'],
    ),
    responses={
        200: 'User logged in successfully',
        400: 'Invalid username or password',
        405: 'Method Not Allowed'
    }
)
@api_view(['POST'])
def login_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
        except (KeyError, json.JSONDecodeError) as e:
            return JsonResponse({'error': 'Malformed data, error: ' + str(e)}, status=400)

        user = authenticate(username=username, password=password)
        if user is not None:
            # Authentication successful
            login(request, user)
            return JsonResponse({'status': 'success', 'user_id': user.pk})
        else:
            # Authentication failed
            print("Failed login attempt for username:", username)
            return JsonResponse({'error': 'Invalid username or password'}, status=400)
    else:
        return HttpResponse(status=405)

@swagger_auto_schema(
    method='post',
    operation_summary="Log out a user",
    operation_description="Log out the current authenticated user.",
    responses={
        200: 'User logged out successfully',
        405: 'Method Not Allowed'
    }
)
@api_view(['POST'])
@csrf_exempt
def logout_user(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'status': 'success'})
    else:
        return HttpResponse(status=405)
    

@csrf_exempt
@swagger_auto_schema(
    method='get',
    operation_summary="Get feed by username",
    operation_description="Retrieve the feed for a specific user by their username.",
    manual_parameters=[
        openapi.Parameter(
            name='username',
            in_=openapi.IN_QUERY,
            type=openapi.TYPE_STRING,
            description="Username of the user",
            required=True
        ),
    ],
    responses={
        200: 'Feed retrieved successfully',
        400: 'username parameter is required',
        404: 'User not found'
    }
)
@api_view(['GET'])
def feed_view(request):
    username = request.GET.get('username')
    print(username)
    if username is None:
        return JsonResponse({'error': 'username parameter is required'}, status=400)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    following_routes = user.get_following_routes().order_by('-likes')[:10]
    following_route_json = serializers.serialize('json', following_routes)
    following_route_list = json.loads(following_route_json)
    return JsonResponse(following_route_list, safe=False)


@csrf_exempt
@swagger_auto_schema(
    method='get',
    operation_summary="Get feed by user ID",
    operation_description="Retrieve the feed for a specific user by their ID.",
    manual_parameters=[
        openapi.Parameter(
            name='user_id',
            in_=openapi.IN_QUERY,
            type=openapi.TYPE_STRING,
            description="ID of the user",
            required=True
        ),
    ],
    responses={
        200: 'Feed retrieved successfully',
        404: 'User not found'
    }
)
@api_view(['GET'])
def feed_view_via_id_web(request):
    print(request.GET)
    user_id = request.GET.get('user_id')
    print(user_id)
    try:
        user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    print(user.get_following_routes())
    following_routes = user.get_following_routes().order_by('-likes')

    routes_list = [{
        'route_id': route.route_id,
        'title': route.title,
        'description': route.description,
        'photos': route.photos,
        'rating': route.rating,
        'likes': route.likes,
        'comments': route.comments,
        'saves': route.saves,
        'node_ids': route.node_ids,
        'node_names': route.node_names,
        'duration': route.duration,
        'duration_between': route.duration_between,
        'mapView': route.mapView,
        'username': User.objects.get(user_id=route.user).username,  
        'user_id': route.user
    } for route in following_routes]

    print(routes_list)
    return JsonResponse(routes_list, safe=False)

@csrf_exempt
@require_POST
@swagger_auto_schema(
    method='post',
    operation_summary="Follow a user",
    operation_description="Follow a specific user by their ID.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'follow_user_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID of the user to follow'),
            'user_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID of the current user'),
        },
        required=['follow_user_id', 'user_id'],
    ),
    responses={
        200: 'User followed successfully',
        404: 'User not found',
        400: 'Bad Request',
        405: 'Method Not Allowed'
    }
)
@api_view(['POST'])
def follow_user(request):
    try:
        data = json.loads(request.body)
        user_to_follow_id = data.get('follow_user_id') 
        current_user_id = data.get('user_id')  

        user_to_follow = User.objects.get(user_id=user_to_follow_id)
        current_user = User.objects.get(user_id=current_user_id)  # Get the current user object

        current_user.following.add(user_to_follow)
        return JsonResponse({'status': 'success'})
    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)


@csrf_exempt
@require_POST
@swagger_auto_schema(
    method='post',
    operation_summary="Unfollow a user",
    operation_description="Unfollow a specific user by their ID.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'unfollow_user_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID of the user to unfollow'),
            'user_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID of the current user'),
        },
        required=['unfollow_user_id', 'user_id'],
    ),
    responses={
        200: 'User unfollowed successfully',
        404: 'User not found',
        400: 'Bad Request',
        405: 'Method Not Allowed'
    }
)
@api_view(['POST'])
def unfollow_user(request):
    try:
        data = json.loads(request.body)
        user_to_unfollow_id = data.get('unfollow_user_id') 
        current_user_id = data.get('user_id')  

        user_to_unfollow = User.objects.get(user_id=user_to_unfollow_id)
        current_user = User.objects.get(user_id=current_user_id)  # Get the current user object

        current_user.following.remove(user_to_unfollow)
        return JsonResponse({'status': 'success'})

    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)


@csrf_exempt
@swagger_auto_schema(
    method='post',
    operation_summary="Check if a user is following another user",
    operation_description="Check if the current user is following a specific user by their ID.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'user_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID of the current user which we want to check if s/he is following another user'),
        },
        required=['user_id'],
    ),
    responses={
        200: 'Check completed successfully',
        404: 'User not found',
        400: 'Bad Request',
        405: 'Method Not Allowed'
    }
)
@api_view(['POST'])
def check_following(request, user_id):
    try:
        data = json.loads(request.body)
        current_user_id = data.get('user_id')
        user_to_check = User.objects.get(user_id=user_id)
        current_user = User.objects.get(user_id=current_user_id)
        is_following = current_user.following.filter(user_id=user_to_check.user_id).exists()
        return JsonResponse({'isFollowing': is_following})
    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

@csrf_exempt
@swagger_auto_schema(
    method='post',
    operation_summary="Check if a user likes a route",
    operation_description="Check if the current user has liked a specific route.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'user_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID of the current user'),
            'route_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID of the route'),
        },
        required=['user_id', 'route_id'],
    ),
    responses={
        200: 'Check completed successfully',
        404: 'User not found',
        400: 'Bad Request',
        405: 'Method Not Allowed'
    }
)
@api_view(['POST'])
def check_like(request):
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        route_id = data.get('route_id')

        user = User.objects.get(user_id=user_id)
        is_liked = route_id in user.liked_routes
        return JsonResponse({'isLiked': is_liked})
    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

@csrf_exempt
@swagger_auto_schema(
    method='post',
    operation_summary="Like or unlike a route",
    operation_description="Toggle like status for a specific route by the current user.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'user_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID of the current user'),
            'route_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID of the route'),
        },
        required=['user_id', 'route_id'],
    ),
    responses={
        200: 'Like status toggled successfully',
        404: 'User not found',
        400: 'Bad Request',
        405: 'Method Not Allowed'
    }
)
@api_view(['POST'])
@csrf_exempt
def like_route(request):
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        route_id = data.get('route_id')
        user = User.objects.get(user_id=user_id)
        route = Route.objects.get(route_id=route_id)

        if route_id in user.liked_routes:
            user.liked_routes.remove(route_id)
            route.likes -= 1
            user.save()
            route.save()
            return JsonResponse({'status': 'success', 'liked': False, "likes": route.likes})
        else:
            user.liked_routes.append(route_id)
            route.likes += 1
            user.save()
            route.save()

        
            return JsonResponse({'status': 'success', 'liked': True, "likes": route.likes})
    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)


@csrf_exempt
@swagger_auto_schema(
    method='post',
    operation_summary="Bookmark or unbookmark a route",
    operation_description="Toggle bookmark status for a specific route by the current user.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'user_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID of the current user'),
            'route_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID of the route'),
        },
        required=['user_id', 'route_id'],
    ),
    responses={
        200: 'Bookmark status toggled successfully',
        404: 'User not found',
        400: 'Bad Request',
        405: 'Method Not Allowed'
    }
)
@api_view(['POST'])
@csrf_exempt
def bookmark_route(request):
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        route_id = data.get('route_id')
        user = User.objects.get(user_id=user_id)
        
        if route_id in user.saved_routes:
            user.saved_routes.remove(route_id)
            user.save()
            return JsonResponse({'status': 'success', 'bookmarked': False})
        else:
            user.saved_routes.append(route_id)
            user.save()
            return JsonResponse({'status': 'success', 'bookmarked': True})
    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)
    
@csrf_exempt
@swagger_auto_schema(
    method='post',
    operation_summary="Check if a user has bookmarked a route",
    operation_description="Check if the current user has bookmarked a specific route.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'user_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID of the current user'),
            'route_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID of the route'),
        },
        required=['user_id', 'route_id'],
    ),
    responses={
        200: 'Check completed successfully',
        404: 'User not found',
        400: 'Bad Request',
        405: 'Method Not Allowed'
    }
)
@api_view(['POST'])
@csrf_exempt
def check_bookmark(request):
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        route_id = data.get('route_id')
        user = User.objects.get(user_id=user_id)
        is_bookmarked = route_id in user.saved_routes
        return JsonResponse({'isBookmarked': is_bookmarked})
    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)
    

@csrf_exempt
@swagger_auto_schema(
    method='get',
    operation_summary="Load all bookmarks for a user",
    operation_description="Retrieve all routes bookmarked by a specific user.",
    manual_parameters=[
        openapi.Parameter('user_id', openapi.IN_QUERY, description="ID of the user", type=openapi.TYPE_STRING),
    ],
    responses={
        200: 'Bookmarks retrieved successfully',
        404: 'User not found'
    }
)
@api_view(['GET'])
def load_bookmarks(request):
    try:
        user_id = request.GET.get('user_id')
        user = User.objects.get(user_id=user_id)
        bookmarked_routes = Route.objects.filter(route_id__in=user.saved_routes)
        print(bookmarked_routes)

        bookmarked_routes_list = [{
            'route_id': route.route_id,
            'title': route.title,
            'description': route.description,
            'photos': route.photos,
            'rating': route.rating,
            'likes': route.likes,
            'comments': route.comments,
            'saves': route.saves,
            'node_ids': route.node_ids,
            'node_names': route.node_names,
            'duration': route.duration,
            'duration_between': route.duration_between,
            'mapView': route.mapView,
            'username': User.objects.get(user_id=route.user).username,  
            'user_id': route.user
        } for route in bookmarked_routes]

        return JsonResponse(bookmarked_routes_list, safe=False)
    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)

@csrf_exempt
@swagger_auto_schema(
    method='post',
    operation_summary="Add a comment to a route",
    operation_description="Add a comment to a specific route by the current user.",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'user_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID of the current user'),
            'route_id': openapi.Schema(type=openapi.TYPE_STRING, description='ID of the route'),
            'comment': openapi.Schema(type=openapi.TYPE_STRING, description='Comment text'),
        },
        required=['user_id', 'route_id', 'comment'],
    ),
    responses={
        200: 'Comment added successfully',
        404: 'User or Route not found',
        400: 'Bad Request',
        405: 'Method Not Allowed'
    }
)
@api_view(['POST'])
def add_comment(request):
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        route_id = data.get('route_id')
        comment_text = data.get('comment')

        user = User.objects.get(user_id=user_id)
        route = Route.objects.get(route_id=route_id)

        comment = f"{user.username}: {comment_text}"
        route.comments.append(comment)
        route.save()

        return JsonResponse({'status': 'success', 'comments': route.comments})
    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)
    except Route.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Route not found'}, status=404)



@csrf_exempt
@api_view(['GET'])
def my_routes(request):
    try:
        user_id = request.GET.get('user_id')
        own_routes = Route.objects.filter(user=user_id)
        print(own_routes)

        own_routes_list = [{
            'route_id': route.route_id,
            'title': route.title,
            'description': route.description,
            'photos': route.photos,
            'rating': route.rating,
            'likes': route.likes,
            'comments': route.comments,
            'saves': route.saves,
            'node_ids': route.node_ids,
            'node_names': route.node_names,
            'duration': route.duration,
            'duration_between': route.duration_between,
            'mapView': route.mapView,
            'username': User.objects.get(user_id=route.user).username,  
            'user_id': route.user
        } for route in own_routes]


        return JsonResponse(own_routes_list, safe=False)
    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'User not found'}, status=404)