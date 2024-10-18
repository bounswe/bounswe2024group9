from django.http import JsonResponse
from SPARQLWrapper import SPARQLWrapper, JSON
from .Utils.utils import *
from .Utils.forms import *
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login


@login_required
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


@login_required
def run_code_view(request):
    # TODO Uncomment the lines after connecting to the front-end

    # source_code = request.POST.get('source_code', '')
    # language_id = request.POST.get('language_name', '')

    # TODO Example usage, delete this part after connecting to the front-end
    source_code = "print('Hello, World!')"
    language_id = 71  # Language ID for Python

    result = run_code(source_code, language_id)
    return JsonResponse(result)


def wikipedia_data_views(request):
    qid = "Q28865"  # (temporary) Q-ID for Python
    info_object = modify_data(qid)
    return render(request, 'wikipedia_data.html', {'language': info_object})


def signup(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        
        if form.is_valid():
            form.save()  # This saves the new user
            return redirect('login')  # Redirect to some page after sign-up, e.g., the home page
        else:
            print(form.errors)
    else:
        form = SignupForm()

    return render(request, 'signup.html', {'form': form})

def home(request):
    return render(request, 'home.html')