import json
from django.test import TestCase
from .Utils.utils import run_code
from .views import wiki_result, wiki_search
from .models import User
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

# class TestSearchResult(TestCase):
#     # def setUp(self):
#     #     # Create a sample user for testing
#     #     self.user = User.objects.create_user(
#     #         username='testuser',
#     #         email="test",
#     #         password='testpassword'
#     #     )
#     #     self.factory = RequestFactory()

#         # test that the wiki_search returns correct labels even for multi-word strings
#     def test_search_valid(self):

#         # @login_required decorator requires a request object with a user attribute
#         # self.client.login(username='testuser', email='test', password='testpassword')
#         # request = self.factory.get('/result/1')
#         # request.user = self.user

#         request = None

#         response = wiki_search(request, "Python Java")
#         response_dict = json.loads(response.content)
#         bindings = response_dict['results']['bindings']
#         language_labels = [binding['languageLabel']['value'] for binding in bindings]
#         self.assertTrue("Python 3" in language_labels)
#         self.assertTrue("Java 21" in language_labels)

#     # test that an invalid search does not crash and returns just empty bindings
#     def test_search_invalid(self):
#         # @login_required decorator requires a request object with a user attribute
#         # self.client.login(username='testuser', email='test', password='testpassword')
#         # request = self.factory.get('/result/1')
#         # request.user = self.user

#         request = None

#         response = wiki_search(request, "this_is_not_a_language_1234@#")
#         response_dict = json.loads(response.content)
#         self.assertTrue(response_dict['results']['bindings'] == [])  # empty bindings response expected

#     # test the output of the wiki_result with a valid input
#     def test_result_valid(self):
#         # @login_required decorator requires a request object with a user attribute
#         # self.client.login(username='testuser', email='test', password='testpassword')
#         # request = self.factory.get('/result/1')
#         # request.user = self.user

#         request = None

#         response = wiki_result(request, "Q15777")  # C programming language
#         response_dict = json.loads(response.content)
#         self.assertTrue(response_dict['mainInfo'][0]['languageLabel']['value'] == 'C')
#         self.assertTrue(response_dict['mainInfo'][0]['website']['value'] == 'https://www.iso.org/standard/74528.html')
#         self.assertTrue(response_dict['wikipedia']['title'] == 'C (programming language)')

#     def test_result_invalid(self):
#         # @login_required decorator requires a request object with a user attribute
#         # self.client.login(username='testuser', email='test', password='testpassword')
#         # request = self.factory.get('/result/1')
#         # request.user = self.user

#         request = None

#         response = wiki_result(request, "Qabc")  # invalid wiki id
#         response_dict = json.loads(response.content)
#         self.assertTrue(response_dict['mainInfo'] == [])
#         self.assertTrue(response_dict['wikipedia'] == [])
#         self.assertTrue(response_dict['instances'] == [])


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
