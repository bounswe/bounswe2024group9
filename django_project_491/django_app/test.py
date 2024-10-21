import json
from django.test import TestCase
from .Utils.utils import run_code
from .views import wiki_result, wiki_search
from .models import User


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
    # def setUp(self):
    #     # Create a sample user for testing
    #     self.user = User.objects.create_user(
    #         username='testuser',
    #         email="test",
    #         password='testpassword'
    #     )
    #     self.factory = RequestFactory()

        # test that the wiki_search returns correct labels even for multi-word strings
    def test_search_valid(self):

        # @login_required decorator requires a request object with a user attribute
        # self.client.login(username='testuser', email='test', password='testpassword')
        # request = self.factory.get('/result/1')
        # request.user = self.user

        request = None

        response = wiki_search(request, "Python Java")
        response_dict = json.loads(response.content)
        bindings = response_dict['results']['bindings']
        language_labels = [binding['languageLabel']['value'] for binding in bindings]
        self.assertTrue("Python 3" in language_labels)
        self.assertTrue("Java 21" in language_labels)

    # test that an invalid search does not crash and returns just empty bindings
    def test_search_invalid(self):
        # @login_required decorator requires a request object with a user attribute
        # self.client.login(username='testuser', email='test', password='testpassword')
        # request = self.factory.get('/result/1')
        # request.user = self.user

        request = None

        response = wiki_search(request, "this_is_not_a_language_1234@#")
        response_dict = json.loads(response.content)
        self.assertTrue(response_dict['results']['bindings'] == [])  # empty bindings response expected

    # test the output of the wiki_result with a valid input
    def test_result_valid(self):
        # @login_required decorator requires a request object with a user attribute
        # self.client.login(username='testuser', email='test', password='testpassword')
        # request = self.factory.get('/result/1')
        # request.user = self.user

        request = None

        response = wiki_result(request, "Q15777")  # C programming language
        response_dict = json.loads(response.content)
        self.assertTrue(response_dict['mainInfo'][0]['languageLabel']['value'] == 'C')
        self.assertTrue(response_dict['mainInfo'][0]['website']['value'] == 'https://www.iso.org/standard/74528.html')
        self.assertTrue(response_dict['wikipedia']['title'] == 'C (programming language)')

    def test_result_invalid(self):
        # @login_required decorator requires a request object with a user attribute
        # self.client.login(username='testuser', email='test', password='testpassword')
        # request = self.factory.get('/result/1')
        # request.user = self.user

        request = None

        response = wiki_result(request, "Qabc")  # invalid wiki id
        response_dict = json.loads(response.content)
        self.assertTrue(response_dict['mainInfo'] == [])
        self.assertTrue(response_dict['wikipedia'] == [])
        self.assertTrue(response_dict['instances'] == [])
