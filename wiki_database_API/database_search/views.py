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

import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def create_user(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        name = request.POST.get('name')
        e_mail = request.POST.get('email')
        password = request.POST.get('password')
        is_superuser = request.POST.get('is_superuser', 'False') == 'on'

        if not username or not password:
            return JsonResponse({'error': 'Username and password are required.'}, status=400)

        # Validation checks and additional logic goes here
        if is_superuser:
            # Create a superuser or staff user if the corresponding flags are set
            user = User.objects.create_superuser(username, password, e_mail=e_mail, name=name, is_superuser=is_superuser)
        else:
            # Regular user creation
            user = User.objects.create_user(username, password, e_mail=e_mail, name=name)

        return JsonResponse({'status': 'success', 'user_id': user.pk, 'is_superuser': user.is_superuser, 'is_staff': user.is_staff})
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
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(username=username, password=password)
        if user is not None:
            # Authentication successful
            login(request, user)
            return JsonResponse({'status': 'success', 'user_id': user.pk})
        else:
            # Authentication failed
            return JsonResponse({'error': 'Invalid username or password'}, status=400)
    else:
        return HttpResponse(status=405)