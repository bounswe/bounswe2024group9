from django.urls import path
from .views import comment_views, question_views, user_views, utilization_views

from django.contrib.auth.views import LoginView, LogoutView

urlpatterns = [

    path('home/', utilization_views.home, name='home'),

    path('wikipedia/', utilization_views.wikipedia_data_views, name='wikipedia'),
    path('search/<str:search_strings>', utilization_views.wiki_search, name='wiki_search'),
    path('result/<str:wiki_id>', utilization_views.wiki_result, name='wiki_result'),
    path('get_api_languages/', utilization_views.get_run_coder_api_languages, name='get_run_coder_api_languages'),

    path('login/', user_views.login_user, name='login'),
    path('signup/', user_views.signup, name='signup'),
    path('get_user_profile_by_username/<str:username>/', user_views.get_user_profile_by_username, name='get_user_profile'),
    path('edit_user_profile/<int:will_be_edited_user_id>/', user_views.edit_user_profile, name='edit_user_profile'),
    path('delete_user_profile/<int:will_be_deleted_user_id>/', user_views.delete_user_profile, name='delete_user_profile'),
    path('logout/', LogoutView.as_view(), name='logout'),

    path('get_question/<int:question_id>/', question_views.get_question_details, name='get_question'),
    path('question/<int:question_id>/comments/', question_views.get_question_comments, name='get_question_comments'),
    path('create_question/', question_views.create_question, name='create_question'),
    path('edit_question/<int:question_id>/', question_views.edit_question, name='edit_question'),
    path('delete_question/<int:question_id>/', question_views.delete_question, name='delete_question'),
    path('mark_as_answered/<int:question_id>/', question_views.mark_as_answered, name='mark_as_answered'), 
    path('report_question/<int:question_id>/', question_views.report_question, name='report_question'),
    path('list_questions_by_language/<str:language>/<int:page_number>', question_views.list_questions_by_language, name='list_questions'),
    path('list_questions_by_tags/<str:tags>/<int:page_number>/', question_views.list_questions_by_tags, name='list_questions_by_tags'),
    path('list_questions_by_hotness/<int:page_number>', question_views.list_questions_by_hotness, name='get_question_comments'),
    path('random_questions/', question_views.random_questions, name='random_questions'),

    path('upvote_object/<int:question_id>/', utilization_views.upvote_object, name='upvote_object'), # TODO: CHANGE THE UPVOTE LOGIC
    path('downvote_object/<int:question_id>/', utilization_views.downvote_object, name='downvote_object'), # TODO: CHANGE THE DOWNVOTE LOGIC

    path('create_comment/', comment_views.create_comment, name='create_comment'),
    path('edit_comment/<int:comment_id>', comment_views.edit_comment, name='edit_comment'),
    path('delete_comment/<int:comment_id>', comment_views.delete_comment, name='delete_comment'),

    path('code_execute/', utilization_views.post_sample_code, name='code_execute'), # for dynamic code execution
    path('run_code/', utilization_views.run_code_view, name='run_code'),

]
