from django.http import JsonResponse
from SPARQLWrapper import SPARQLWrapper, JSON

def search(request):
    # TODO: the search_string should not be hardcoded, but should be taken from user's input in the searchbar
    search_string = "hagia"

    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")

    # TODO: add more details to the query, now it returns the title, description, longitude, latitude
    query = f"""
SELECT DISTINCT ?item ?itemLabel ?description ?latitude ?longitude (YEAR(?inception) AS ?inceptionYear) ?styleLabel WHERE {{
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
  }}
  OPTIONAL {{ 
    ?item wdt:P625 ?coordinates.
  }}
  BIND(IF(BOUND(?coordinates), STRAFTER(STR(?coordinates), "("), "") AS ?coordsString)
  BIND(IF(BOUND(?coordsString), STRBEFORE(?coordsString, " "), "") AS ?latitude)
  BIND(IF(BOUND(?latitude), STRBEFORE(STRAFTER(?coordsString, " "), ")"), "") AS ?longitude)
  OPTIONAL {{ 
    ?item wdt:P571 ?inception. 
  }}
  OPTIONAL {{ 
    ?item wdt:P149 ?style .
    SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" }}
    ?style rdfs:label ?styleLabel.
    FILTER(LANG(?styleLabel) = "en")
  }}
  FILTER(contains(lcase(?itemLabel), "{search_string}") || contains(lcase(?description), "{search_string}"))
}}
ORDER BY DESC(COALESCE(?coordinates, ?description)) ?latitude ?longitude
"""

    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    return JsonResponse(results)


def top_5_nearby(request):
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    longitude = 41.008333
    latitude = 28.98
    query = f"""
SELECT DISTINCT ?item ?itemLabel ?description ?latitude ?longitude (YEAR(?inception) AS ?inceptionYear) (STR(?distance) AS ?distanceString) WHERE {{
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
    BIND(STRBEFORE(?coordsString, " ") AS ?latString)
    BIND(STRBEFORE(STRAFTER(?coordsString, " "), ")") AS ?longString)
    BIND(xsd:float(?latString) AS ?latitude)
    BIND(xsd:float(?longString) AS ?longitude)
    OPTIONAL {{ ?item wdt:P571 ?inception. }}
    BIND(abs(((?longitude - {longitude})*(?longitude - {longitude}) + (?latitude - {latitude})*(?latitude - {latitude}))) AS ?distanceSquared)
    BIND(?distanceSquared AS ?distance)
  }}
  FILTER(BOUND(?distance) && ?distance > 1e-10)
}}
ORDER BY ?distance
LIMIT 5
"""



    # Set the query string and format
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    # Execute the query and parse the results
    results = sparql.query().convert()

    return JsonResponse(results)



def top_5_period(request):
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    inception = 532
    
    query = f"""
SELECT DISTINCT ?item ?itemLabel ?description ?latitude ?longitude (YEAR(?inception) AS ?inceptionYear) WHERE {{
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
    BIND(STRBEFORE(?coordsString, " ") AS ?latString)
    BIND(STRBEFORE(STRAFTER(?coordsString, " "), ")") AS ?longString)
    BIND(xsd:float(?latString) AS ?latitude)
    BIND(xsd:float(?longString) AS ?longitude)
    OPTIONAL {{ ?item wdt:P571 ?inception. }}
    BIND(abs(xsd:integer(YEAR(?inception)) - {inception}) AS ?period)
  }}
  FILTER(BOUND(?period))
}}
ORDER BY ?period
LIMIT 5
OFFSET 1
"""


    # Set the query string and format
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    # Execute the query and parse the results
    results = sparql.query().convert()

    return JsonResponse(results)
