from django.http import JsonResponse
from SPARQLWrapper import SPARQLWrapper, JSON
from .utils import run_code

def wikidata_query_view(request):
    # search_string = request.GET.get('search', '').split()  # Assuming 'search' is passed as a query parameter
    # filter_conditions = " && ".join([f'CONTAINS(LCASE(?itemLabel), "{term.lower()}")' for term in search_string])
    # subqueries = "\n".join([f'BIND( IF(CONTAINS(LCASE(?itemLabel), "{term.lower()}"), 1, 0) AS ?match_{i})' for i, term in enumerate(search_string)])
    
    query = f"""
        SELECT ?language ?languageLabel WHERE {{
  ?language wdt:P31 wd:Q9143.  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}  
}}
LIMIT 10
    """
    # 'programming language' (Q9143)
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    
    try:
        results = sparql.query().convert()
        return JsonResponse(results)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


def run_code_view(request):
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
    result = run_code(query, language_id)
    return JsonResponse(result)