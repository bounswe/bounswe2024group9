from django.urls import path
from .views import comment_views, question_views, user_views, utilization_views
from django.conf.urls.static import static
from django.conf import settings

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
    path('logout/', user_views.logout_user, name='logout'),
    path('auth/check_token/', user_views.check_token, name='check_token'),
    path('upload-profile-pic/', user_views.upload_profile_pic, name='upload_profile_pic'),
    path('reset_password/', user_views.reset_password_request_mail, name='reset_password'),
    path('reset_password/<str:uidb64>/<str:token>/', user_views.reset_password, name='reset_password'),

    path('get_top_five_contributors/', user_views.list_most_contributed_five_person, name='get_top_five_contributors'),
    
    path('get_question/<int:question_id>/', question_views.get_question_details, name='get_question'),
    path('question/<int:question_id>/comments/', question_views.get_question_comments, name='get_question_comments'),
    path('create_question/', question_views.create_question, name='create_question'),
    path('edit_question/<int:question_id>/', question_views.edit_question, name='edit_question'),
    path('delete_question/<int:question_id>/', question_views.delete_question, name='delete_question'),
    path('mark_as_answered/<int:question_id>/', question_views.mark_as_answered, name='mark_as_answered'), 
    path('report_question/<int:question_id>/', question_views.report_question, name='report_question'),
    path('bookmark_question/<int:question_id>/', question_views.bookmark_question, name='bookmark_question'),
    path('remove_bookmark/<int:question_id>/', question_views.remove_bookmark, name='remove_bookmark'),
    path('get_random_reported_question/', question_views.fetch_random_reported_question, name='ger_random_reported_question'),

    path('list_questions_by_language/<str:language>/<int:page_number>', question_views.list_questions_by_language, name='list_questions'),
    path('list_questions_by_tags/<str:tags>/<int:page_number>/', question_views.list_questions_by_tags, name='list_questions_by_tags'),
    path('list_questions_by_hotness/<int:page_number>', question_views.list_questions_by_hotness, name='get_question_comments'),
    path('random_questions/', question_views.random_questions, name='random_questions'),



    path('upvote_object/<str:object_type>/<int:object_id>/', utilization_views.upvote_object, name='upvote_object'),
    path('downvote_object/<str:object_type>/<int:object_id>/', utilization_views.downvote_object, name='downvote_object'),

    path('create_comment/<int:question_id>', comment_views.create_comment, name='create_comment'),
    path('edit_comment/<int:comment_id>', comment_views.edit_comment, name='edit_comment'),
    path('delete_comment/<int:comment_id>', comment_views.delete_comment, name='delete_comment'),
    path('mark_comment_as_answer/<int:comment_id>', comment_views.mark_comment_as_answer, name='mark_comment_as_answer'),

    path('run_code/<str:type>/<int:id>/', utilization_views.run_code_of_question_or_comment, name='run_code'),


    path('list_questions/', question_views.list_questions_by_language, name='list_questions'),
    # path('run_code/', utilization_views.run_code_view, name='run_code'),
    path('code_execute/', utilization_views.post_sample_code, name='code_execute'),
    path('interested_languages/', user_views.add_interested_languages_for_a_user, name='interested_languages'),
    path('specific_feed/<int:user_id>/', question_views.list_questions_according_to_the_user, name='specific_feed'),
    path('question_of_the_day/', question_views.question_of_the_day, name='question_of_the_day'),
    path('daily_question/', question_views.question_of_the_day, name='wiki_search'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
