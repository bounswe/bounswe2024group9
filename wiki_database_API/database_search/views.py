from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404
from .models import Route, Node, User
from django.core import serializers
import json

def route_list(request):
    routes = Route.objects.all()
    routes_list = serializers.serialize('json', routes)
    return JsonResponse(routes_list, safe=False)

def route_detail(request, pk):
    route = get_object_or_404(Route, pk=pk)
    route_json = serializers.serialize('json', [route]) # Node is put in array because serialize expects a list
    route_data = json.loads(route_json)[0]  # Deserialize the JSON and take the first element
    return JsonResponse(route_data, safe=False)

def node_list(request):
    nodes = Node.objects.all()
    nodes_list = serializers.serialize('json', nodes)
    return JsonResponse(nodes_list, safe=False)

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
        user = User.objects.create_user(username=username, password=password, e_mail=e_mail, name=name)
        
        # Set additional fields if needed
        user.name = name
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
def create_node(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        photo = request.POST.get('photo')
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')

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
    
@csrf_exempt
def logout_user(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'status': 'success'})
    else:
        return HttpResponse(status=405)