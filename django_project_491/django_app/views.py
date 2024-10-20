from django.http import JsonResponse
from SPARQLWrapper import SPARQLWrapper, JSON
from .Utils.utils import *
from .Utils.forms import *
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login
from urllib.parse import quote
from django.core.cache import cache
import requests


# Used for initial search - returns 5 best matching wiki id's
@login_required
def wiki_search(request, search_strings):
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")

    search_terms = search_strings.split()  # split into words

    # Generate SPARQL FILTER for each word in the search string
    filter_conditions = " || ".join(
        [f'CONTAINS(LCASE(?languageLabel), "{quote(term.lower())}")' for term in search_terms])

    query = f"""
    SELECT DISTINCT ?language (SAMPLE(?languageLabel) as ?languageLabel) 
    WHERE {{
        ?language wdt:P31 wd:Q9143.
        ?language rdfs:label ?languageLabel.

        # Filter for language names containing any of the search terms
        FILTER({filter_conditions})

        # Ensure that the label is in English
        FILTER(LANG(?languageLabel) = "en")

        SERVICE wikibase:label {{ 
        bd:serviceParam wikibase:language "en". 
        }}
    }}
    GROUP BY ?language
    ORDER BY STRLEN(?languageLabel)
    LIMIT 5
    """

    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()

    return JsonResponse(results)


# Shows the resulting info of the chosen wiki item
@login_required
def wiki_result(response, wiki_id):
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")

    # First query to get the main language information
    query_main_info = f"""
      SELECT ?language ?languageLabel ?wikipediaLink ?influencedByLabel ?publicationDate ?inceptionDate ?website
      WHERE {{
        BIND(wd:{wiki_id} AS ?language)

        # Get the label of the language in English
        ?language rdfs:label ?languageLabel.
        FILTER(LANG(?languageLabel) = "en")

        OPTIONAL {{ ?language wdt:P737 ?influencedBy. }}
        OPTIONAL {{ ?language wdt:P577 ?publicationDate. }}
        OPTIONAL {{ ?language wdt:P571 ?inceptionDate. }}
        OPTIONAL {{ ?language wdt:P856 ?website. }}
        OPTIONAL {{
            ?wikipediaLink schema:about ?language;
            schema:isPartOf <https://en.wikipedia.org/>.
        }}

        SERVICE wikibase:label {{ 
          bd:serviceParam wikibase:language "en". 
        }}
      }}
      LIMIT 1
    """

    sparql.setQuery(query_main_info)
    sparql.setReturnFormat(JSON)
    main_info_results = sparql.query().convert()

    # Second query to get all instances of the language, excluding "programming language"
    query_instances = f"""
      SELECT ?instance ?instanceLabel
      WHERE {{
        BIND(wd:{wiki_id} AS ?language)

        ?language wdt:P31 ?instance.
        OPTIONAL {{ ?instance rdfs:label ?instanceLabel. FILTER(LANG(?instanceLabel) = "en") }}
        FILTER(?instance != wd:Q9143)  # Exclude programming language (wd:Q9143)
      }}
      LIMIT 3
    """

    sparql.setQuery(query_instances)
    sparql.setReturnFormat(JSON)
    instances_results = sparql.query().convert()

    # Process the results to combine main info and instances
    instances = [
        {
            'instance': result['instance']['value'],
            'instanceLabel': result['instanceLabel']['value']
        }
        for result in instances_results['results']['bindings']
        if 'instanceLabel' in result
    ]

    # Fetch Wikipedia data
    try:
        wikipedia_data = wikipedia_data_views(wiki_id)
    except Exception as e:
        wikipedia_data = []

    # For each instance, find 3 other languages of that instance excluding the current language
    for instance in instances:
        instance_id = instance['instance'].split('/')[-1]  # Extract the ID from the URI
        query_related_languages = f"""
            SELECT ?relatedLanguage ?relatedLanguageLabel
            WHERE {{
                ?relatedLanguage wdt:P31 wd:{instance_id}.
                FILTER(?relatedLanguage != wd:{wiki_id})  # Exclude the current language
                OPTIONAL {{ ?relatedLanguage rdfs:label ?relatedLanguageLabel. FILTER(LANG(?relatedLanguageLabel) = "en") }}
            }}
            LIMIT 3
        """
        sparql.setQuery(query_related_languages)
        sparql.setReturnFormat(JSON)
        related_languages_results = sparql.query().convert()

        # Extract related languages and add to the instance
        related_languages = [
            {
                'relatedLanguage': result['relatedLanguage']['value'],  # Store the related language URI
                'relatedLanguageLabel': result['relatedLanguageLabel']['value']  # Store the label
            }
            for result in related_languages_results['results']['bindings']
            if 'relatedLanguageLabel' in result
        ]
        instance['relatedLanguages'] = related_languages  # Add related languages to the instance

    final_response = {
        'mainInfo': main_info_results['results']['bindings'],
        'instances': instances,
        'wikipedia': wikipedia_data
    }

    return JsonResponse(final_response)


def wikipedia_data_views(wiki_id):
    info_object = modify_data(wiki_id)
    return info_object


def get_languages():
    """
    Get a list of supported languages from Judge0 API.
    """
    Lang2ID = cache.get('Lang2ID')

    if Lang2ID is not None:
        return Lang2ID

    # If not cached, make the API request
    response = requests.get('https://judge0-ce.p.rapidapi.com/languages', headers=HEADERS)
    if response.status_code == 200:
        # Parse and cache the result with no timeout (indefinite caching)
        Lang2ID = {lang['name']: lang['id'] for lang in response.json()}
        cache.set('Lang2ID', Lang2ID, timeout=None)  # Cache indefinitely
        return Lang2ID
    else:
        if check_api_key(response):
            return get_languages()

        # Todo Notify user about having the API connection issue
        return None


@login_required
def run_code_view(request):
    source_code = request.POST.get('source_code', '')
    language_name = request.POST.get('language_name', '')
    Lang2ID = get_languages()
    result = run_code(source_code, Lang2ID[language_name])
    return JsonResponse(result)



# TODO The signup function is used to test the functionality of the authentication system
# Thus when the front-end is connected, this function will be removed
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


# Todo A sample home page view for testing purposes, will be removed after front-end connection.
def home(request):
    return render(request, 'home.html')
