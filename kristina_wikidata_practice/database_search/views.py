from django.shortcuts import render, get_object_or_404
from .models import Route, User

# List Views
def route_list(request):
    routes = Route.objects.all()  # Get all Route instances from the database
    return render(request, 'route_list.html', {'routes': routes})

def user_data_list(request):
    users_data = User.objects.select_related('user').all()  # Get all User instances
    return render(request, 'user_data_list.html', {'users_data': users_data})

# Detail Views
def route_detail(request, pk):
    route = get_object_or_404(Route, pk=pk)  # Get a single Route instance
    return render(request, 'route_detail.html', {'route': route})

def user_data_detail(request, pk):
    user_data = get_object_or_404(User, pk=pk)  # Get a single User instance
    return render(request, 'user_data_detail.html', {'user_data': user_data})

