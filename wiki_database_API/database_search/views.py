from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Route, Node
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