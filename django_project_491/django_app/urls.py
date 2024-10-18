from django.urls import path
from .views import *
from django.contrib.auth.views import LoginView, LogoutView

urlpatterns = [
    path('run_code/', run_code_view, name='run_code'),
    path('wikipedia/', wikipedia_data_views, name='wikipedia'),
    path('login/', LoginView.as_view(template_name='login.html'), name='login'),
    path('signup/', signup, name='signup'),
    path('home/', home, name='home'),
    path('logout/', LogoutView.as_view(), name='logout'),  
]
