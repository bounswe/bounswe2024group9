from django.http import JsonResponse
from SPARQLWrapper import SPARQLWrapper, JSON
from .Utils.utils import *
from .Utils.forms import *
from django.shortcuts import render, redirect
from urllib.parse import quote

# Used for initial search - returns 5 best matching wiki id's
def wiki_search(request, search_strings):
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    
    search_terms = search_strings.split() # split into words
    
    # Generate SPARQL FILTER for each word in the search string
    filter_conditions = " || ".join([f'CONTAINS(LCASE(?languageLabel), "{quote(term.lower())}")' for term in search_terms])

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

        # Get all instances of the language, excluding programming languages
        ?language wdt:P31 ?instance.
        OPTIONAL {{ ?instance rdfs:label ?instanceLabel. FILTER(LANG(?instanceLabel) = "en") }}
        FILTER(?instance != wd:Q9143)  # Exclude programming language (wd:Q9143)
      }}
    """

    sparql.setQuery(query_instances)
    sparql.setReturnFormat(JSON)
    instances_results = sparql.query().convert()

    # Process the results to combine main info and instances
    instances = [result['instanceLabel']['value'] for result in instances_results['results']['bindings'] if 'instanceLabel' in result]

    final_response = {
        'mainInfo': main_info_results['results']['bindings'],
        'instances': instances,
        'wikipedia': wikipedia_data_views(wiki_id)
    }

    return JsonResponse(final_response)

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
    

def wikipedia_data_views(wiki_id): 
    info_object = modify_data(wiki_id)
    return info_object
    
    
