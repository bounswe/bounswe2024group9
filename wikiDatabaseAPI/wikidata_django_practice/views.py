# views.py of any of your apps

from django.shortcuts import render

def index(request):
    return render(request, 'index.html')

# TODO : IN FUTURE MERGE THE 2 SEARCH OPTION