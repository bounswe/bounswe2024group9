from django.urls import path
from .views import *
from django.contrib.auth.views import LoginView, LogoutView

urlpatterns = [
    path('run_code/', run_code_view, name='run_code'),
    path('wikipedia/', wikipedia_data_views, name='wikipedia'),
    path('login/', login_user, name='login'),
    path('signup/', signup, name='signup'),
    path('home/', home, name='home'),
    path('logout/', LogoutView.as_view(), name='logout'),  
    path('create_comment/', create_comment, name='create_comment'),
    path('create_question/', create_question, name='create_question'),
    path('list_questions/', list_questions_by_language, name='list_questions'),
    path('run_code/', run_code_view, name='run_code'),
]
