import json
from django.test import TestCase, Client
from .Utils.utils import run_code
from .views.utilization_views import wiki_result, wiki_search
from .models import User
from django.urls import reverse
from unittest.mock import patch, MagicMock

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
