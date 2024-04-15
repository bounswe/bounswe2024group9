from django.http import JsonResponse
from SPARQLWrapper import SPARQLWrapper, JSON

def search(request):
    # TODO: the search_string should not be hardcoded, but should be taken from user's input in the searchbar
    search_string = "hagia"

    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")

    # TODO: add more details to the query, now it returns the title, description, longitude, latitude
    search_string = "galata"

    query = f"""
    SELECT DISTINCT ?item ?itemLabel ?description ?latitude ?longitude WHERE {{
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
      {{
        SELECT DISTINCT ?item ?itemLabel WHERE {{
          ?item p:P131 ?statement0.
          ?statement0 (ps:P131/(wdt:P131*)) wd:Q406.
          ?item rdfs:label ?itemLabel.
          FILTER(LANG(?itemLabel) = "en")
        }}
      }}
      OPTIONAL {{
        ?item schema:description ?description.
        FILTER(LANG(?description) = "en")
        OPTIONAL {{ ?item wdt:P625 ?coordinates. }}
        BIND(STRAFTER(STR(?coordinates), "(") AS ?coordsString)
        BIND(STRBEFORE(?coordsString, " ") AS ?latitude)
        BIND(STRBEFORE(STRAFTER(?coordsString, " "), ")") AS ?longitude)
      }}
      FILTER(contains(lcase(?itemLabel), "{search_string}") || contains(lcase(?description), "{search_string}"))
    }}
    ORDER BY DESC(COALESCE(?coordinates, ?description)) ?latitude ?longitude
    LIMIT 100
    """

    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    return JsonResponse(results)
