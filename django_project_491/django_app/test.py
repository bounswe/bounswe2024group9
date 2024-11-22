import json
from django.test import TestCase, Client
from .Utils.utils import run_code
from .views.utilization_views import wiki_result, wiki_search
from django.utils import timezone
from .models import User, Comment, Question, Comment_Vote, Question_Vote, UserType, VoteType
from datetime import timedelta
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken


from django.urls import reverse

# class TestRunCode(TestCase):
#     # def setUp(self):
#     #     # Create a sample user for testing
#     #     self.user = User.objects.create_user(
#     #         username='testuser',
#     #         email="test",
#     #         password='testpassword'
#     #     )
#     #
#     # def test_run_code(self):
#     #     # Test the run_code function with a simple Python code
#     #     self.client.login(username='testuser', email='test', password='testpassword')
#     #
#     #     response = self.client.post('/run_code/', {
#     #         'source_code': 'print("Hello, World!")',
#     #         'language_name': 'Python (3.8.1)'})
#     #
#     #     self.assertEqual(response.status_code, 200)
#     #     self.assertTrue('stdout' in response.json())
#     #     self.assertTrue(response.json()['stdout'].startswith('Hello, World!'))
#     #
#     # def test_authentication(self):
#     #     response = self.client.get('/run_code/', {
#     #         'source_code': 'print("Hello, World!")',
#     #         'language_name': 'Invalid Language Name'})
#     #     self.assertEqual(response.status_code, 302)  # Redirect to login page
#


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

    def test_question_creation(self):
        # Test if question is created successfully
        self.assertEqual(self.question.title, 'Sample Question')
        self.assertEqual(self.question.language, 'Python')
        self.assertEqual(self.question.language_id, 71)
        self.assertEqual(self.question.details, 'How to test models in Django?')
        self.assertEqual(self.question.code_snippet, 'print("Test")')
        self.assertEqual(self.question.tags, ['Django', 'Testing'])
        self.assertEqual(self.question.topic, 'Django Testing')
        self.assertEqual(self.question.author.username, 'testuser')

    def test_question_snippet_execution(self):
        # Test if the `run_snippet` method works
        result = self.question.run_snippet()
        self.assertIn('Test', result)  # Ensure the output matches the snippet's print statement

    def test_mark_as_answered(self):
        # Test if the `mark_as_answered` method works
        self.question.mark_as_answered()
        self.question.refresh_from_db()  # Refresh the instance
        self.assertTrue(self.question.answered)

    def test_question_upvotes(self):
        # Test the upvotes field
        self.assertEqual(self.question.upvotes, 0)  # Initially, upvotes should be 0
        self.question.upvotes += 1
        self.question.save()
        self.assertEqual(self.question.upvotes, 1)  # After incrementing, upvotes should be 1

    def test_reported_by_relationship(self):
        # Test the ManyToMany relationship with `reported_by`
        self.assertEqual(self.question.reported_by.count(), 0)  # Initially, no reports
        self.question.reported_by.add(self.user)
        self.question.save()
        self.assertEqual(self.question.reported_by.count(), 1)  # After adding, it should be 1
        self.assertEqual(self.question.reported_by.first().username, 'testuser')  # Ensure the user is added

    def test_question_str_method(self):
        """Test the string representation of the Question model."""
        question_str = str(self.question)
        self.assertIn(self.question.title, question_str)  # The title should be in the string representation
        self.assertIn(self.question.language, question_str)  # The language should also be in the string representation

    def test_question_created_at(self):
        # Test if the `created_at` field is automatically set
        self.assertTrue(self.question.created_at)
        self.assertTrue(isinstance(self.question.created_at, timezone.datetime))

    def test_question_topic(self):
        # Test if the `topic` field is correctly saved
        self.assertEqual(self.question.topic, 'Django Testing')

    def test_question_tags(self):
        # Test if the `tags` field is correctly saved
        self.assertEqual(self.question.tags, ['Django', 'Testing'])



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
            language_id=71,
            question=self.question,
            author=self.user
        )

        # Create a test vote
        self.vote = Question_Vote.objects.create(
            vote_type=VoteType.UPVOTE.value,
            user=self.user,
            question=self.question
        )

    def test_question_vote_creation(self):
        # Test if the vote is created correctly
        self.assertEqual(self.vote.vote_type, 'upvote')
        self.assertEqual(self.vote.user.username, 'testuser')
        self.assertEqual(self.vote.question.title, 'Sample Question')

    def test_comment_vote_creation(self):
        # Test if the comment vote is created correctly
        comment_vote = Comment_Vote.objects.create(
            vote_type=VoteType.DOWNVOTE.value,
            user=self.user,
            comment=self.comment
        )
        self.assertEqual(comment_vote.vote_type, 'downvote')
        self.assertEqual(comment_vote.user.username, 'testuser')
        self.assertEqual(comment_vote.comment.details, 'This is a test comment')

    def test_vote_str_method(self):
        # Test the string representation of the vote
        vote_str = str(self.vote)
        self.assertIn(self.user.username, vote_str)
        self.assertIn(self.vote.vote_type, vote_str)
        self.assertIn(self.question.title, vote_str)

class UserModelTest(TestCase):

    def setUp(self):
        self.username = 'testuser'
        self.password = 'testpassword123'
        self.email = 'testuser@example.com'
        self.user = get_user_model().objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password
        )

    def test_user_creation(self):
        """Test that the user is created correctly."""
        user = self.user
        self.assertEqual(user.username, self.username)
        self.assertEqual(user.email, self.email)
        self.assertTrue(user.check_password(self.password))
        
        # Check that the default userType is 'USER'
        self.assertEqual(user.userType.value, "user")  # Compare with the string 'user'
        
        # Ensure the user is not an admin (based on userType)
        self.assertNotEqual(user.userType.value, "admin")  # Compare with the string 'admin'


    def test_user_type_default(self):
        """Test that the default user type is 'USER'."""
        user = self.user
        self.assertEqual(user.userType, UserType.USER)  # Compare enum members

    def test_user_str_method(self):
        """Test the __str__ method of the User model."""
        user = self.user
        self.assertEqual(str(user), self.username)

    def test_check_and_promote(self):
        """Test that the user promotion logic works."""
        user = self.user
        # Before promotion
        self.assertEqual(user.userType, UserType.USER)  # Compare enum members
        
        # Simulate enough points for promotion
        user.calculate_total_points = lambda: 150  # Simulate enough points
        user.check_and_promote()
        self.assertEqual(user.userType, UserType.SUPER_USER)  # Compare enum members
        
        # Simulate losing points for demotion
        user.calculate_total_points = lambda: 50  # Simulate low points
        user.check_and_promote()
        self.assertEqual(user.userType, UserType.USER)  # Compare enum members

class UserViewsTest(TestCase):

    def setUp(self):
        self.username = 'testuser'
        self.password = 'testpassword123'
        self.email = 'testuser@example.com'
        self.user = get_user_model().objects.create_user(
            username=self.username,
            email=self.email,
            password=self.password
        )
        self.admin = get_user_model().objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpassword123'
        )
        self.client = self.client  # Django's test client for making requests

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

    # def test_edit_user_profile(self):
    #     """Test editing user profile."""
    #     url = reverse('edit_user_profile', args=[self.user.pk])
    #     self.client.login(username=self.username, password=self.password)
    #     data = {
    #         'username': 'newusername',
    #         'email': 'newemail@example.com',
    #         'bio': 'Updated bio'
    #     }
    #     response = self.client.post(url, json.dumps(data), content_type="application/json")
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.user.refresh_from_db()
    #     self.assertEqual(self.user.username, 'newusername')
    #     self.assertEqual(self.user.email, 'newemail@example.com')

    # def test_delete_user_profile(self):
    #     """Test deleting user profile."""
    #     url = reverse('delete_user_profile', args=[self.user.pk])
    #     self.client.login(username=self.username, password=self.password)
    #     response = self.client.delete(url)
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     with self.assertRaises(get_user_model().DoesNotExist):
    #         self.user.refresh_from_db()  # Ensure user is deleted

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

    # def test_logout_user(self):
    #     """Test user logout."""
    #     url = reverse('logout')
    #     # Get JWT token for login
    #     refresh = RefreshToken.for_user(self.user)
    #     data = {'token': str(refresh.access_token)}
    #     response = self.client.post(url, data, content_type="application/json")
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertIn('status', response.json())
    #     self.assertEqual(response.json()['status'], 'success')

    def test_reset_password_request(self):
        """Test requesting a password reset link."""
        url = reverse('reset_password')
        data = {'email': self.email}
        response = self.client.post(url, json.dumps(data), content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.json())

    # def test_reset_password_view(self):
    #     """Test resetting password with a valid token."""
    #     token = 'fake-token'
    #     uidb64 = 'fake-uid'
    #     url = reverse('reset_password', args=[uidb64, token])
    #     data = {
    #         'new_password': 'newpassword123',
    #         'confirm_password': 'newpassword123'
    #     }
    #     response = self.client.post(url, data)
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)

    # def test_list_most_contributed_five_person(self):
    #     """Test listing the top 5 users by contributions."""
    #     url = reverse('get_top_five_contributors')
    #     response = self.client.get(url)
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertIn('users', response.json())
    #     self.assertEqual(len(response.json()['users']), 5)
