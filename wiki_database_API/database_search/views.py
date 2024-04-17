from django.shortcuts import render, get_object_or_404
# from .models import RouteObject, UserObject
from django.http import JsonResponse

# # List Views
# def route_list(request):
#     routes = RouteObject.objects.all()  # Get all Route instances from the database
#     return JsonResponse(routes )

# def user_data_list(request):
#     users_data = UserObject.objects.select_related('user').all()  # Get all User instances
#     return JsonResponse(users_data)

# def find_user(request, user_id):
#     user = get_object_or_404(UserObject, pk=user_id)
#     return JsonResponse(user)