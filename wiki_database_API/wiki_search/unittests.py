import unittest
from unittest.mock import patch
from django.test import RequestFactory
from django.http import JsonResponse
from views import search, results
import os
from django.conf import settings
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
settings.configure()

class TestSearchView(unittest.TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    # test the most typical search example - Hagia Sophia appears in a result
    def test_basic_search_view(self): 
        request = self.factory.get('/search/')
        response = search(request, "hagia")
        self.assertIsInstance(response, JsonResponse)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        hagia_sophia_found = any(result['itemLabel']['value'] == "Hagia Sophia" for result in data['results']['bindings'])
        self.assertTrue(hagia_sophia_found, "Hagia Sophia not found in search results")

    # test a search example where no returns are expected
    def test_empty_search_view(self): 
        request = self.factory.get('/search/')
        response = search(request, "manhattan")
        self.assertIsInstance(response, JsonResponse)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['results']['bindings'], [], "Expected empty search results")

    # test a search example with multiple words, results containing only one should be shown too
    def test_input_search_view(self): 
        request = self.factory.get('/search/')
        response = search(request, "galata tower")
        self.assertIsInstance(response, JsonResponse)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        galata_tower_found = any(result['itemLabel']['value'] == "Galata Tower" for result in data['results']['bindings'])
        tower_found = any(result['itemLabel']['value'] == "Nusretiye Clock Tower" for result in data['results']['bindings'])
        self.assertTrue(galata_tower_found, "Galata Tower not found in search results")
        self.assertTrue(tower_found, "Nusretiye Clock Tower not found in search results")



    

class TestResultsView(unittest.TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    @patch('views.top_5_nearby')
    @patch('views.top_5_period')
    # test the typical results example - Hagia Sophia
    def test_basic_results_view(self, mock_top_5_period, mock_top_5_nearby): 
        mock_top_5_period.return_value = {'mock_period': 1000}
        mock_top_5_nearby.return_value = {'mock_nearby': 'some_item'}

        request = self.factory.get('/results/Q12506')
        response = results(request, "Q12506")
        data = json.loads(response.content)
        self.assertIsInstance(response, JsonResponse)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['results']['bindings'][0]['itemLabel']['value'], "Hagia Sophia")
        self.assertEqual(data['results']['bindings'][0]['latitude']['value'], '28.98')
        self.assertEqual(data['results']['bindings'][0]['longitude']['value'], '41.008333333')
        self.assertEqual(data['results']['bindings'][0]['inceptionYear']['value'], '532')

    # test an item which should show no results on our page
    def test_empty_results_view(self): 
        request = self.factory.get('/results/Q1234567')
        response = results(request, "Q1234567")
        data = json.loads(response.content)
        self.assertIsInstance(response, JsonResponse)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['results']['bindings'], [])

    # test an item which would have some properties - such as name, longitude, latitude, but no inception for example
    def test_partial_results_view(self):
        request = self.factory.get('/results/Q6054093')
        response = results(request, "Q6054093")
        data = json.loads(response.content)
        self.assertIsInstance(response, JsonResponse)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['results']['bindings'][0]['itemLabel']['value'], 'Ortaköy Jewish cemetery')
        self.assertNotIn('inception', data['results']['bindings'][0], "Expected 'inception' not to be in the results")

if __name__ == '__main__':
    unittest.main()
