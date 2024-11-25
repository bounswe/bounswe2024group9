import json

from django.test import TestCase, Client
from django.core import mail
from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.files.uploadedfile import SimpleUploadedFile

from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken

from datetime import timedelta
from unittest.mock import patch
from io import BytesIO

from .Utils.utils import run_code
from .views.utilization_views import wiki_result, wiki_search
from .models import User, Comment, Question, Comment_Vote, Question_Vote, UserType, VoteType
from django.urls import reverse
from unittest.mock import patch, MagicMock

class TestSearchResult(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        self.client.login(username='testuser', password='testpassword')  # Log in the test user

    def test_wiki_search_found(self):
            search_strings = 'Python Java' # Valid search string

            url = reverse('wiki_search', kwargs={'search_strings': search_strings})
            response = self.client.get(url)

            self.assertEqual(response.status_code, 200)
            response_json = response.json()
            self.assertGreater(len(response_json['results']), 0)
            self.assertIn('Python', [page['languageLabel']['value'] for page in response_json['results']['bindings']])
            self.assertIn('Java', [page['languageLabel']['value'] for page in response_json['results']['bindings']])

    def test_search_invalid(self):
        search_strings = 'this_is_not_a_language_1234' # Invalid search string

        url = reverse('wiki_search', kwargs={'search_strings': search_strings})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertTrue(response_json['results']['bindings'] == [])  # Empty bindings response expected

    def test_result_valid(self):
        wiki_id = "Q15777" # C programming language

        url = reverse('wiki_result', kwargs={'wiki_id': wiki_id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertTrue(response_json['mainInfo'][0]['languageLabel']['value'] == 'C')
        self.assertTrue(response_json['mainInfo'][0]['website']['value'] == 'https://www.iso.org/standard/74528.html')
        self.assertTrue(response_json['wikipedia']['title'] == 'C (programming language)')

    def test_result_invalid(self):
        wiki_id = "Qabc" # Invalid programming language

        url = reverse('wiki_result', kwargs={'wiki_id': wiki_id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertTrue(response_json['mainInfo'] == [])
        self.assertTrue(response_json['wikipedia'] == [])
        self.assertTrue(response_json['instances'] == [])

class CodeExecutionTests(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser', 
            email='test@example.com', 
            password='testpassword'
        )
    def test_post_sample_code(self):
        # Log in with the test user
        self.client.login(username='testuser', password='testpassword')

        # Define source code and language ID for Python
        source_code = 'print("Hello, World!")'
        language_id = 71  # ID for Python 3.8 in Judge0

        # Send a POST request to post_sample_code endpoint
        response = self.client.post(
            reverse('code_execute'),  
            data=json.dumps({
                'source_code': source_code,
                'language_id': language_id
            }),
            content_type='application/json'
        )

        # Validate response status and content
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertIn('stdout', response_json)
        self.assertTrue(response_json['stdout'].startswith('Hello, World!'))

class UserWorkflowIntegrationTests(TestCase):
    def setUp(self):
        # Create a test client
        self.client = Client()

        # Create a test user
        self.user = User.objects.create_user(username='testuser', password='testpassword', email='test@gmail.com')

    @patch('SPARQLWrapper.SPARQLWrapper.query')
    def test_user_search_and_view_results(self, mock_sparql_query):
        """
        Integration test: A logged-in user searches for "scala" and views details using a received qid.
        """
        # Log the user in
        self.client.login(username='testuser', password='testpassword')

        # Mock SPARQL response for the search query
        mock_search_result = {
            "results": {
                "bindings": [
                    {"language": {"value": "http://www.wikidata.org/entity/Q12345"}, "languageLabel": {"value": "Scala"}}
                ]
            }
        }

        # Mock SPARQL response for the result query
        mock_result_main_info = {
            "results": {
                "bindings": [
                    {"languageLabel": {"value": "Scala"}, "wikipediaLink": {"value": "https://en.wikipedia.org/wiki/Scala"}}
                ]
            }
        }
        mock_result_instances = {
            "results": {
                "bindings": []
            }
        }

        # Configure side effects for SPARQL queries
        mock_sparql_query.side_effect = [
            MagicMock(convert=lambda: mock_search_result),  # Search response
            MagicMock(convert=lambda: mock_result_main_info),  # Main info response
            MagicMock(convert=lambda: mock_result_instances),  # Instances response
        ]

        # Step 1: Search for "scala"
        search_response = self.client.get('/search/scala')
        self.assertEqual(search_response.status_code, 200)
        search_data = json.loads(search_response.content)
        self.assertIn("results", search_data)
        self.assertEqual(len(search_data["results"]["bindings"]), 1)

        # Extract qid from search results
        qid = search_data["results"]["bindings"][0]["language"]["value"].split('/')[-1]
        self.assertEqual(qid, "Q12345")  # Verify correct qid is extracted

        # Step 2: View details for the extracted qid
        result_response = self.client.get(f'/result/{qid}')
        print(result_response)
        self.assertEqual(result_response.status_code, 200)
        result_data = json.loads(result_response.content)

        # Verify the result content
        self.assertIn("mainInfo", result_data)
        self.assertEqual(len(result_data["mainInfo"]), 1)
        self.assertEqual(result_data["mainInfo"][0]["languageLabel"]["value"], "Scala")
        self.assertEqual(result_data["mainInfo"][0]["wikipediaLink"]["value"], "https://en.wikipedia.org/wiki/Scala")

        # Verify instances and Wikipedia data
        self.assertIn("instances", result_data)
        self.assertEqual(len(result_data["instances"]), 0)  # No instances mocked in this example

    def tearDown(self):
        # Clean up by deleting the test user
        self.user.delete()

class CommentModelTest(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )

        # Create a test question
        self.question = Question.objects.create(
            title='Sample Question',
            language='Python',
            details='How to test models in Django?',
            code_snippet='print("Test")',
            author=self.user
        )

        # Create a test comment
        self.comment = Comment.objects.create(
            details='This is a test comment',
            code_snippet='print("Test comment")',
            language_id=71,
            question=self.question,
            author=self.user
        )

    def test_comment_creation(self):
        # Test if comment is created successfully
        self.assertEqual(self.comment.details, 'This is a test comment')
        self.assertEqual(self.comment.language_id, 71)
        self.assertEqual(self.comment.question.title, 'Sample Question')
        self.assertEqual(self.comment.author.username, 'testuser')

    def test_run_snippet(self):
        # Test if the `run_snippet` method returns correct output
        result = self.comment.run_snippet()
        self.assertIn('Test comment', result)  # Ensure the output matches the snippet's print statement

class QuestionModelTest(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )

        # Create a test question
        self.question = Question.objects.create(
            title='Sample Question',
            language='Python',
            language_id=71,  # Language ID for Python
            details='How to test models in Django?',
            code_snippet='print("Test")',
            tags=['Django', 'Testing'],
            topic='Django Testing',
            author=self.user
        )

    def test_question_snippet_execution(self):
        # Test if the `run_snippet` method works
        result = self.question.run_snippet()
        self.assertIn('Test', result)  # Ensure the output matches the snippet's print statement

    def test_mark_as_answered(self):
        # Test if the `mark_as_answered` method works
        # Create a comment for the question
        comment = Comment.objects.create(
            details='This is a test comment',
            code_snippet='print("Test comment")',
            language='Python',
            question=self.question,
            author=self.user
        )
        
        # Mark the comment as the answer
        self.question.mark_as_answered(comment._id)
        self.question.refresh_from_db()  # Refresh the instance
        self.assertTrue(self.question.answered)

    def test_question_str_method(self):
        """Test the string representation of the Question model."""
        question_str = str(self.question)
        self.assertIn(self.question.title, question_str)  # The title should be in the string representation
        self.assertIn(self.question.language, question_str)  # The language should also be in the string representation

class VoteModelTest(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )

        # Create a test question
        self.question = Question.objects.create(
            title='Sample Question',
            language='Python',
            details='How to test models in Django?',
            code_snippet='print("Test")',
            author=self.user
        )

        # Create a test comment
        self.comment = Comment.objects.create(
            details='This is a test comment',
            code_snippet='print("Test comment")',
            language='Python',
            question=self.question,
            author=self.user
        )

        # Create a test vote for the question
        self.vote = Question_Vote.objects.create(
            vote_type=VoteType.UPVOTE.value,
            user=self.user,
            question=self.question
        )

        # Create a test vote for the comment
        self.comment_vote = Comment_Vote.objects.create(
            vote_type=VoteType.UPVOTE.value,
            user=self.user,
            comment=self.comment
        )

    def test_question_vote_creation(self):
        # Test if the question vote is created correctly
        self.assertEqual(self.vote.vote_type, 'upvote')
        self.assertEqual(self.vote.user.username, 'testuser')
        self.assertEqual(self.vote.question.title, 'Sample Question')

    def test_comment_vote_creation(self):
        # Test if the comment vote is created correctly
        self.assertEqual(self.comment_vote.vote_type, 'upvote')
        self.assertEqual(self.comment_vote.user.username, 'testuser')
        self.assertEqual(self.comment_vote.comment.details, 'This is a test comment')

    def test_vote_str_method(self):
        # Test the string representation of the vote for the question
        vote_str = str(self.vote)
        self.assertIn(self.user.username, vote_str)
        self.assertIn(self.vote.vote_type, vote_str)
        self.assertIn(self.question.title, vote_str)

        # Test the string representation of the vote for the comment
        comment_vote_str = str(self.comment_vote)
        self.assertIn(self.user.username, comment_vote_str)
        self.assertIn(self.comment_vote.vote_type, comment_vote_str)
        self.assertIn(self.comment.details, comment_vote_str)

class UserModelTest(TestCase):
    def setUp(self):
        """Set up a test user."""
        self.username = 'testuser'
        self.password = 'testpassword123'
        self.email = 'testuser@example.com'
        self.user = get_user_model().objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password
        )

        # Create a question to associate with comments
        self.question = Question.objects.create(
            title="Sample Question",
            details="Details of the sample question",
            author=self.user
        )

    # The reason this unittest is commented is, the self.questions.count() call in calculate_total_points
    # returns 1 all the time. Test will be uncommented after the count fix.
    # def test_calculate_total_points(self):
    #     """Test that the total points calculation works correctly."""
    #     user = self.user
        
    #     # Test with no questions or comments
    #     self.assertEqual(user.calculate_total_points(), 0)

    #     # Add a question (2 points)
    #     self.user.questions.add(self.question)  # Correctly associate the question with the user
    #     self.assertEqual(user.calculate_total_points(), 2)

    #     # Add a comment (1 point since it's not an answer), associated with the question
    #     user.authored_comments.create(details="This is a comment.", answer_of_the_question=False, question=self.question)
    #     self.assertEqual(user.calculate_total_points(), 3)

    #     # Add a comment answering a question (5 points), associated with the question
    #     user.authored_comments.create(details="This is an answer.", answer_of_the_question=True, question=self.question)
    #     self.assertEqual(user.calculate_total_points(), 8)

    def test_check_and_promote_to_super_user(self):
        """Test that the user is promoted to SUPER_USER when their points exceed the threshold."""
        user = self.user

        # Simulate enough points for promotion
        user.calculate_total_points = lambda: 150  # 150 points for promotion
        user.check_and_promote()

        # Assert that the user has been promoted to SUPER_USER
        self.assertEqual(user.userType, UserType.SUPER_USER)

    def test_check_and_demote_to_user(self):
        """Test that the user is demoted to USER if their points fall below the threshold."""
        user = self.user

        # Simulate enough points for promotion
        user.calculate_total_points = lambda: 150  # 150 points for promotion
        user.check_and_promote()

        # Simulate a drop in points below the promotion threshold
        user.calculate_total_points = lambda: 50  # Less than the threshold for promotion
        user.check_and_promote()

        # Assert that the user has been demoted to USER
        self.assertEqual(user.userType, UserType.USER)

class UserViewsTests(TestCase):
    def setUp(self):
        self.username = 'testuser'
        self.password = 'testpassword123'
        self.email = 'testuser@example.com'
        self.user = get_user_model().objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password
        )

        self.user.known_languages = ['Python', 'JavaScript']
        self.user.interested_topics = ['AI', 'Web Development']
        self.user.save()
        
        self.admin = get_user_model().objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpassword123'
        )
        self.client = APIClient()
        # Generate tokens for the user
        self.refresh_token = RefreshToken.for_user(self.user)
        self.access_token = str(AccessToken.for_user(self.user))

    def test_get_user_profile_by_username(self):
        """Test retrieving user profile by username."""
        url = reverse('get_user_profile_by_username', args=[self.username])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.json())
        self.assertEqual(response.json()['user']['username'], self.username)

    def test_get_user_profile_by_id(self):
        """Test retrieving user profile by user ID."""
        url = reverse('user_profile_by_id', args=[self.user.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['user']['username'], self.username)

    def test_edit_user_profile(self):
        """Test editing user profile."""
        url = reverse('edit_user_profile', args=[self.user.pk])
        self.client.login(username=self.username, password=self.password)
        headers = {'HTTP_USER_ID': str(self.user.pk)}
        data = {
            'username': 'newusername',
            'email': 'newemail@example.com',
            'bio': 'Updated bio'
        }
        response = self.client.post(url, json.dumps(data), content_type="application/json", **headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'newusername')
        self.assertEqual(self.user.email, 'newemail@example.com')

    def test_delete_user_profile(self):
        """Test deleting user profile."""
        url = reverse('delete_user_profile', args=[self.user.pk])
        self.client.login(username=self.username, password=self.password)
        headers = {'HTTP_USER_ID': str(self.user.pk)}
        response = self.client.delete(url, **headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        with self.assertRaises(get_user_model().DoesNotExist):
            self.user.refresh_from_db()  # Ensure user is deleted

    def test_signup(self):
        """Test user signup."""
        url = reverse('signup')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password1': 'newpassword123',
            'password2': 'newpassword123'
        }
        response = self.client.post(url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.json())  # Check that JWT token is returned

    def test_login_user(self):
        """Test user login."""
        url = reverse('login')
        data = {
            'username': self.username,
            'password': self.password
        }
        response = self.client.post(url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.json())  # Check for the JWT token in response

    def test_add_interested_languages_for_a_user(self):
        """Test updating user's interested languages."""
        url = reverse('interested_languages')
        data = {
            'user_id': self.user.pk,
            'interested_topics': ['Python', 'Django'],
            'known_languages': ['English', 'Spanish']
        }
        response = self.client.post(url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.interested_topics, ['Python', 'Django'])
        self.assertEqual(self.user.known_languages, ['English', 'Spanish'])

    def test_get_user_preferred_languages(self):
        """Test retrieving user's preferred languages and interested topics."""
        url = reverse('preferred_languages')  # Update with the actual URL name/path
        response = self.client.post(
            url,
            data=json.dumps({'user_id': self.user.pk}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertEqual(response_data['known_languages'], ['Python', 'JavaScript'])
        self.assertEqual(response_data['interested_topics'], ['AI', 'Web Development'])

    def test_logout_user(self):
        # Authenticate the client with the access token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

        # Send the POST request with the refresh token
        response = self.client.post(
            reverse('logout'),
            data=json.dumps({'token': str(self.refresh_token)}),
            content_type='application/json',
        )

        # Assert the status code and response content
        self.assertEqual(response.status_code, 200, f"Response data: {response.content}")
        response_data = response.json()
        self.assertEqual(response_data['status'], 'success')
        self.assertEqual(response_data['message'], 'User logged out successfully')

    def test_check_token(self):
        """Test checking the validity of a token."""
        url = reverse('check_token')  # Update with the actual URL name/path
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['status'], 'Token is valid')

        # Test with an invalid token
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalidtoken')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 401)

    def test_upload_profile_pic(self):
        """Test uploading a profile picture."""
        url = reverse('upload_profile_pic')  # Update with the actual URL name/path
        image = BytesIO()
        image.write(b'test image content')
        image.seek(0)
        uploaded_file = SimpleUploadedFile("test.jpg", image.read(), content_type="image/jpeg")

        # Test valid upload
        response = self.client.post(
            url,
            {'profile_pic': uploaded_file},
            HTTP_User_ID=str(self.user.pk)  # Include the user ID in the header
        )
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertEqual(response_data['success'], 'Profile picture uploaded successfully')
        self.assertIn('url', response_data)

        # Test missing user ID header
        response = self.client.post(
            url,
            {'profile_pic': uploaded_file}
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['error'], 'User ID parameter is required in the header')

        # Test invalid request method
        response = self.client.get(url)
        self.assertEqual(response.status_code, 405)
        self.assertEqual(response.json()['error'], 'Invalid request method')
    
    def test_reset_password_request(self):
        """Test password reset request email functionality."""
        # Create a user
        user = get_user_model().objects.create_user(
            username='testuserpwres',
            email='testuserpwres@example.com',
            password='testpassword123'
        )

        # Mock a POST request with the user's email
        response = self.client.post(
            reverse('reset_password'),  # Replace with the actual URL name
            data=json.dumps({'email': 'testuserpwres@example.com'}),
            content_type="application/json"
        )

        # Assert that the response is OK
        self.assertEqual(response.status_code, 200)

        # Assert that an email was sent
        self.assertEqual(len(mail.outbox), 1)  # Verify that exactly one email was sent

        # Check the reset link in the HTML content
        email_html = mail.outbox[0].alternatives[0][0]  # HTML version is stored here
        self.assertIn('reset_password', email_html)  # Verify the reset link is in the email HTML content


    @patch('django_app.views.user_views.default_token_generator.check_token', return_value=True)  # Mock valid token
    def test_reset_password_view(self, mock_check_token):
        """Test password reset functionality with valid data."""
        # Create a user
        user = get_user_model().objects.create_user(
            username='testuserpwres',
            email='testuserpwres@example.com',
            password='oldpassword123'
        )

        # Generate UID and token
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # Prepare the POST request
        response = self.client.post(
            reverse('reset_password', args=[uidb64, token]),  # Adjust URL name if needed
            data=json.dumps({
                'new_password': 'newpassword123',
                'confirm_password': 'newpassword123',
            }),
            content_type="application/json"
        )

        # Debug response if the test fails
        if response.status_code != 200:
            print(f"Response Status Code: {response.status_code}")
            print(f"Response Content: {response.json()}")

        # Assert the response is OK
        self.assertEqual(response.status_code, 200)

        # Refresh user data and verify password change
        user.refresh_from_db()
        self.assertTrue(user.check_password('newpassword123'))  # Confirm password is updated

    def test_list_most_contributed_five_person(self):
        """Test listing the top 5 users by contributions."""
        
        # Create users and simulate contributions
        user2 = get_user_model().objects.create_user(username='user2', email='user2@example.com', password='testpassword123')
        user3 = get_user_model().objects.create_user(username='user3', email='user3@example.com', password='testpassword123')
        user4 = get_user_model().objects.create_user(username='user4', email='user4@example.com', password='testpassword123')
        user5 = get_user_model().objects.create_user(username='user5', email='user5@example.com', password='testpassword123')

        # Simulate contributions
        question1 = self.user.questions.create(title='Question 1', details='Details 1')  # 2 points
        question2 = self.user.questions.create(title='Question 2', details='Details 2')  # 2 points
        self.user.authored_comments.create(details='Answer1', answer_of_the_question=True, question=question1)  # 5 points
        user2.authored_comments.create(details='Answer2', answer_of_the_question=True, question=question2)  # 5 points
        question3 = user3.questions.create(title='Question 3', details='Details 3')  # 2 points
        user3.authored_comments.create(details='Answer3', answer_of_the_question=True, question=question3)  # 5 points
        user4.questions.create(title='Question 4', details='Details 4')  # 2 points
        user4.questions.create(title='Question 5', details='Details 5')  # 2 points
        user5.questions.create(title='Question 6', details='Details 6')  # 2 points

        # Now, call the endpoint to get top contributors
        url = reverse('get_top_five_contributors')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        users = response.json()['users']

        # Assert that the order is correct
        self.assertEqual(users[0]['username'], 'testuser')  # Highest contribution (9 points)
        self.assertEqual(users[1]['username'], 'user3') # 7 points
        self.assertEqual(users[2]['username'], 'user2') # 5 points
        self.assertEqual(users[3]['username'], 'user4') # 4 points
        self.assertEqual(users[4]['username'], 'user5') # 2 points

class QuestionViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = get_user_model().objects.create_user(
            username='testuser',
            password='password',
            email="test@gmail.com",
        )
        self.question = Question.objects.create(
            title='Test Question',
            language='Python',
            language_id=71,
            tags=['tag1', 'tag2'],
            details='This is a test question.',
            code_snippet='print("Test")',
            author=self.user
        )
        self.comment = Comment.objects.create(
            details='This is a test comment.',
            author=self.user,
            question=self.question
        )
    def test_get_question(self):
        response = self.client.get(reverse('get_question', args=[self.question._id]))
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertIn('question', response_data)
        self.assertEqual(response_data['question']['title'], self.question.title)
        self.assertEqual(response_data['question']['language'], self.question.language)

    def test_get_question_comments(self):
        response = self.client.get(reverse('get_question_comments', args=[self.question._id]))
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertIn('comments', response_data)
        self.assertEqual(len(response_data['comments']), 1)
        self.assertEqual(response_data['comments'][0]['details'], self.comment.details)

    def test_create_question(self):
        data = {
            'title': 'New Question',
            'language': 'Python (3.12.5)',
            'language_id': 71,
            'details': 'This is a new question.',
            'code_snippet': 'print("Hello, world!");',
            'tags': ['tag3', 'tag4'],
        }
        response = self.client.post(
            reverse('create_question'),
            data=json.dumps(data),
            content_type='application/json',
            **{'HTTP_User-ID': self.user.user_id}
        )
        self.assertEqual(response.status_code, 201)
        response_data = response.json()
        self.assertIn('success', response_data)
        self.assertTrue(response_data['success'])

    def test_edit_question(self):
        data = {
            'title': 'Updated Question',
            'language': 'Python (3.12.5)',
            'language_id': 71,
            'details': 'This is an updated question.'
        }
        response = self.client.put(
            reverse('edit_question', args=[self.question._id]),
            data=json.dumps(data),
            content_type='application/json',
            **{'HTTP_User-ID': self.user.user_id}
        )
        self.assertEqual(response.status_code, 200)
        self.question.refresh_from_db()
        self.assertEqual(self.question.title, data['title'])
        self.assertEqual(self.question.details, data['details'])

    def test_delete_question(self):
        response = self.client.delete(
            reverse('delete_question', args=[self.question._id]),
            **{'HTTP_User-ID': self.user.user_id}
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Question.objects.filter(_id=self.question._id).exists())

    def test_mark_as_answered(self):
        response = self.client.post(
            reverse('mark_as_answered', args=[self.question._id]),
            **{'HTTP_User-ID': self.user.user_id}
        )
        self.assertEqual(response.status_code, 200)
        self.question.refresh_from_db()
        self.assertTrue(self.question.answered)

    def test_report_question(self):
        response = self.client.post(
            reverse('report_question', args=[self.question._id]),
            **{'HTTP_User-ID': self.user.user_id}
        )
        self.assertEqual(response.status_code, 200)
        self.question.refresh_from_db()
        self.assertTrue(self.user in self.question.reported_by.all())

    def test_list_questions_by_language(self):
        response = self.client.get(reverse('list_questions_by_language', args=['Python', 1]))
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertIn('questions', response_data)
        self.assertEqual(response_data['questions'][0]['title'], self.question.title)

    # def test_list_questions_by_tags(self):
    #     response = self.client.get(reverse('list_questions_by_tags', args=['tag1', 1]))
    #     self.assertEqual(response.status_code, 200)
    #     response_data = response.json()
    #     print("tagsssss", response_data)
    #     self.assertIn('questions', response_data)
    #     self.assertEqual(response_data['questions'][0]['tags'], self.question.tags)

    def test_list_questions_by_hotness(self):
        response = self.client.get(reverse('list_questions_by_hotness', args=[1]))
        self.assertEqual(response.status_code, 200)

    def test_random_questions(self):
        response = self.client.get(reverse('random_questions'))
        self.assertEqual(response.status_code, 200)

    def test_bookmark_question(self):
        response = self.client.post(
            reverse('bookmark_question', args=[self.question._id]),
            **{'HTTP_User-ID': self.user.user_id}
        )
        self.assertEqual(response.status_code, 200)
        self.question.refresh_from_db()
        self.assertTrue(self.user in self.question.bookmarked_by.all())

    def test_remove_bookmark(self):
        response = self.client.post(
            reverse('remove_bookmark', args=[self.question._id]),
            **{'HTTP_User-ID': self.user.user_id}
        )
        self.assertEqual(response.status_code, 200)
        self.question.refresh_from_db()
        self.assertFalse(self.user in self.question.bookmarked_by.all())

    def test_fetch_random_reported_question(self):
        response = self.client.post(
            reverse('report_question', args=[self.question._id]),
            **{'HTTP_User-ID': self.user.user_id}
        )
        self.assertEqual(response.status_code, 200)
        response = self.client.get(reverse('get_random_reported_question'))
        self.assertEqual(response.status_code, 200)
        self.assertIn('question', response.json())

    def fetch_all_at_once(self):
        response = self.client.get(reverse('fetch_feed_at_once', args=[self.user._id]))
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertIn('questions', response_data)

class CommentViewsTest(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='testpassword123',
        )
        self.user.userType = UserType.USER.value
        self.user.save()

        # Create an admin user
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpassword123',
        )
        self.admin.userType = UserType.ADMIN.value
        self.admin.save()

        # Generate tokens
        self.user_token = str(AccessToken.for_user(self.user))
        self.admin_token = str(AccessToken.for_user(self.admin))

        # Create a test question (Ensure that question is created before the comment)
        self.question = Question.objects.create(
            title='Test Question',
            language='Python',
            language_id=71,
            tags=['tag1', 'tag2'],
            details='This is a test question.',
            code_snippet='print("Test")',
            author=self.user
        )

    def test_create_comment(self):
        """Test creating a comment for a question."""
        data = {
            "details": "This is a test comment.",
            "code_snippet": "print('Hello World')",
            "language": "Python (3.12.5)"  # Lang2ID valid language
        }

        response = self.client.post(
            reverse('create_comment', args=[self.question._id]),
            data=json.dumps(data),
            content_type='application/json',
            **{'HTTP_User-ID': str(self.user.user_id)}
        )

        # Check the status code
        self.assertEqual(response.status_code, 201)
        
        # Parse the response JSON
        response_data = response.json()
        
        # Check if the response contains 'success' and 'comment_id'
        self.assertIn('success', response_data)
        self.assertIn('comment_id', response_data)

    def test_edit_comment(self):
        """Test editing a comment."""
        # Create a comment to edit
        comment = Comment.objects.create(
            details="Initial Comment",
            code_snippet="print('Hello')",
            language="Python",
            language_id=71,
            author=self.user,
            question=self.question,
        )
        
        # URL for the edit comment endpoint
        url = reverse('edit_comment', args=[comment._id])
        
        # Prepare data to update the comment
        data = {
            "details": "Updated Comment",
            "code_snippet": "print('Updated Hello')",
            "language_id": 2,  # Assuming this is a valid language ID
        }
        
        # Set the correct user ID in headers
        headers = {'HTTP_User-ID': str(self.user.user_id)}
        
        # Authenticate using the user token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        
        # Perform the POST request
        response = self.client.post(url, data, format='json', **headers)

        # Check that the status code is 200 (success)
        self.assertEqual(response.status_code, 200)
        
        # Retrieve the updated comment from the database
        updated_comment = Comment.objects.get(_id=comment._id)
        
        # Check that the comment was actually updated
        self.assertEqual(updated_comment.details, "Updated Comment")
        self.assertEqual(updated_comment.code_snippet, "print('Updated Hello')")
        self.assertEqual(updated_comment.language_id, 2)

    def test_delete_comment(self):
        """Test deleting a comment."""
        # Create a comment to delete
        comment = Comment.objects.create(
            details="Comment to delete",
            code_snippet="",
            language="Python (3.12.5)",  # Valid language
            language_id=71,
            author=self.user,
            question=self.question,
        )
        url = reverse('delete_comment', args=[comment._id])
        headers = {'HTTP_User-ID': str(self.user.user_id)}
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        
        # Perform the DELETE request instead of POST
        response = self.client.delete(url, **headers)

        # Check that the response status code is 200 (success)
        self.assertEqual(response.status_code, 200)
        
        # Ensure the comment no longer exists in the database
        self.assertFalse(Comment.objects.filter(_id=comment._id).exists())

    def test_mark_comment_as_answer(self):
        """Test marking a comment as the answer."""
        # Create a comment to mark as an answer
        comment = Comment.objects.create(
            details="Answer to mark",
            code_snippet="",
            language="Python (3.12.5)",  # Valid language
            language_id=71,
            author=self.user,
            question=self.question,
        )
        
        url = reverse('mark_comment_as_answer', args=[comment._id])
        headers = {'HTTP_User-ID': str(self.user.user_id)}  # Correct user ID header
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        
        # Perform the request to mark the comment as an answer
        response = self.client.post(url, format='json', **headers)

        # Check that the response status code is 200 (success)
        self.assertEqual(response.status_code, 200)
        
        # Refresh the comment object to check if it's marked as an answer
        comment.refresh_from_db()
        self.assertTrue(comment.answer_of_the_question)  # Ensure the comment is marked as the answer
