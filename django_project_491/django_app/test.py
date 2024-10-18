import json
from django.test import TestCase
from .Utils.utils import run_code
from .views import wiki_result, wiki_search


class TestRunCode(TestCase):
        def test_run_code(self):
            query = """
                print("Hello, World!")
                a = 2
                b = 1
                print(a + b)

                import math

                print(math.sqrt(16))

                import numpy as np
                a = np.array([1, 2, 3])
                print(a)
                """
            language_id = 71  # Language ID for Python
            expected = [
                'Hello, World!',
                '3',
                '4.0']
            result = run_code(query, language_id)
            outs = result['stdout'].split('\n')
            print(outs)
            for i in range(len(expected)):
                self.assertTrue(outs[i].startswith(expected[i]))
            self.assertTrue(result['message'] == "Exited with error status 1")

class TestSearchResult(TestCase):

    # test that the wiki_search returns correct labels even for multi-word strings
    def test_search_valid(self):
        request = None
        response = wiki_search(request, "Python Java")
        response_dict = json.loads(response.content)
        bindings = response_dict['results']['bindings']
        language_labels = [binding['languageLabel']['value'] for binding in bindings]
        self.assertTrue("Python 3" in language_labels)
        self.assertTrue("Java 21" in language_labels)
    
    # test that an invalid search does not crash and returns just empty bindings
    def test_search_invalid(self):
        request = None
        response = wiki_search(request, "this_is_not_a_language_1234@#")
        response_dict = json.loads(response.content)
        self.assertTrue(response_dict['results']['bindings']==[]) # empty bindings response expected
    
    # test the output of the wiki_result with a valid input
    def test_result_valid(self):
        request = None
        response = wiki_result(request, "Q15777") # C programming language 
        response_dict = json.loads(response.content)
        self.assertTrue(response_dict['mainInfo'][0]['languageLabel']['value']=='C')
        self.assertTrue(response_dict['mainInfo'][0]['website']['value']=='https://www.iso.org/standard/74528.html')
        self.assertTrue(response_dict['wikipedia']['title']== 'C (programming language)')

    def test_result_invalid(self):
        request = None
        response = wiki_result(request, "Qabc") # invalid wiki id
        response_dict = json.loads(response.content)
        self.assertTrue(response_dict['mainInfo']==[])
        self.assertTrue(response_dict['wikipedia']==[])
        self.assertTrue(response_dict['instances']==[])
