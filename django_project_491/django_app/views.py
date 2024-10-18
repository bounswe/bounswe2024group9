from django.http import JsonResponse
from SPARQLWrapper import SPARQLWrapper, JSON
from .Utils.utils import *
from .Utils.forms import *
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login


# @login_required
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


def wikipedia_data_views(request):
    qid = "Q28865"  # (temporary) Q-ID for Python
    info_object = modify_data(qid)
    return render(request, 'wikipedia_data.html', {'language': info_object})


def signup(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save()  # This saves the new user
            # login(request, user)  # Automatically logs the user in after successful registration
            return redirect('login')  # Redirect to some page after sign-up, e.g., the home page
    else:
        form = SignupForm()

    return render(request, 'signup.html', {'form': form})

def home(request):
    return render(request, 'home.html')