from django.urls import path
from .views import *
from django.contrib.auth.views import LoginView, LogoutView


urlpatterns = [
    path('wikipedia/', wikipedia_data_views, name='wikipedia'),
    path('login/', login_user, name='login'),
    path('signup/', signup, name='signup'),
    path('home/', home, name='home'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('search/<str:search_strings>', wiki_search, name='wiki_search'),
    path('result/<str:wiki_id>', wiki_result, name='wiki_result'),
    path('create_comment/', create_comment, name='create_comment'),
    path('create_question/', create_question, name='create_question'),
    path('list_questions/', list_questions_by_language, name='list_questions'),
    path('run_code/', run_code_view, name='run_code'),
    path('get_api_languages/', get_run_coder_api_languages, name='get_run_coder_api_languages'),
    path('random_questions/', random_questions, name='random_questions'),
    path('question/<int:question_id>/comments/', get_question_comments, name='get_question_comments'),
    path('code_execute/', post_sample_code, name='code_execute'), # for dynamic code execution
    path('question_of_the_day', question_of_the_day, name= 'question_of_the_day'),
    path('interested_languages/', add_interested_languages_for_a_user, name='interested_languages'),
    path('specific_feed/<int:user_id>/',  list_questions_according_to_the_user, name='specific_feed'),
]
