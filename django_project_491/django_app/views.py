from django.http import JsonResponse
from SPARQLWrapper import SPARQLWrapper, JSON
from .Utils.utils import *
from .Utils.forms import *
from django.shortcuts import render, redirect

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
    if request.method == "POST":
        form = code_form(request.POST, choices=LANGUAGES)
        if form.is_valid():
            query = form.cleaned_data['query']
            language_id = int(form.cleaned_data['ProgrammingLanguage'])
            result = run_code(query, language_id)
            if result["stderr"]:
                return render(request, 'run_code.html', {'form': form, 'result': result['stderr']})
            else:
                return render(request, 'run_code.html', {'form': form, 'result': result['stdout']})
    else:
        form = code_form(choices=LANGUAGES)
        return render(request, 'run_code.html', {'form': form})