from django.http import JsonResponse
from SPARQLWrapper import SPARQLWrapper, JSON

def search(request, search_string):
    # TODO: the search_string should not be hardcoded, but should be taken from user's input in the searchbar
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")

    # TODO: add more details to the query, now it returns the title, description, longitude, latitude
    query = f"""
SELECT DISTINCT ?item ?itemLabel ?description WHERE {{
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

  FILTER(contains(lcase(?itemLabel), "{search_string}") || contains(lcase(?description), "{search_string}"))
}}
ORDER BY DESC(COALESCE(?description))
"""

    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    return JsonResponse(results)

def results(request, QID):
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")

    # SPARQL query string with the item as a variable
    query = f"""
    SELECT DISTINCT ?item ?itemLabel ?description ?latitude ?longitude (YEAR(?inception) AS ?inceptionYear) ?styleLabel WHERE {{
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
      BIND(wd:{QID} AS ?item)
      ?item rdfs:label ?itemLabel.
      FILTER(LANG(?itemLabel) = "en")

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
    }}
          LIMIT 1

    """
    # Set the query string and format
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    # Execute the query and parse the results
    results = sparql.query().convert()
    # TODO not null checkers
    longitude = float(results['results']['bindings'][0]['longitude']['value'])
    latitude = float(results['results']['bindings'][0]['latitude']['value'])
    inception = int(results['results']['bindings'][0]['inceptionYear']['value'])

    nearby_entries = top_5_nearby(longitude, latitude)
    same_period_entries = top_5_period(inception)
    final = {'results': results, 'nearby': nearby_entries, 'period': same_period_entries}
    return JsonResponse(final)


def top_5_nearby(longitude, latitude):
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    query = f"""
SELECT DISTINCT ?item ?itemLabel ?description ?latitude ?longitude (STR(?distance) AS ?distanceString) WHERE {{
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
    BIND(abs(((?longitude - {longitude})*(?longitude - {longitude}) + (?latitude - {latitude})*(?latitude - {latitude}))) AS ?distance)
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

    return results


def top_5_period(inception):
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    query = f"""
SELECT DISTINCT ?item ?itemLabel (YEAR(?inception) AS ?inceptionYear) WHERE {{
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
    OPTIONAL {{ ?item wdt:P571 ?inception. }}
    BIND(abs(xsd:integer(YEAR(?inception)) - {inception}) AS ?period)
  }}
  FILTER(BOUND(?period))
}}
ORDER BY ?period
LIMIT 5
OFFSET 1
"""

    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    results = sparql.query().convert()

    return results
