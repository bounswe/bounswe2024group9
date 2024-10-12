from django.test import TestCase
from .utils import run_code


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
