from django.http import JsonResponse
from SPARQLWrapper import SPARQLWrapper, JSON

# Breaks the search string down to separate words, creates filters for all the words,
# matches as many as possible in the query and sorts the outputs according to the matches
def search(request, search_strings):
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    search_string = search_strings.split(" ")

    # Create filter conditions for each search string
    filter_conditions = " || ".join([f"contains(lcase(?itemLabel), \"{s}\") || contains(lcase(?description), \"{s}\")" for s in search_string])

    # Create subqueries to count matches for each search string
    # We want to display the most matches first
    subqueries = "\n".join([f"""
        OPTIONAL {{
            ?item schema:description ?description_{i}.
            FILTER(contains(lcase(?description_{i}), "{s}"))
        }}
        BIND(if(BOUND(?description_{i}), 1, 0) AS ?match_{i})
    """ for i, s in enumerate(search_string)])

    # Create final query combining subqueries and calculating total number of matches
    query = f"""
      SELECT DISTINCT ?item ?itemLabel ?description ({" + ".join([f"?match_{i}" for i in range(len(search_string))])} AS ?totalMatches) WHERE {{
          SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
          {{
              SELECT DISTINCT ?item ?itemLabel WHERE {{
                  ?item p:P131 ?statement0.
                  ?statement0 (ps:P131/(wdt:P131*)) wd:Q406.
                  ?item rdfs:label ?itemLabel.
                  FILTER(LANG(?itemLabel) = "en")
              }}
          }}
          {subqueries}
          FILTER({filter_conditions})
      }}
      ORDER BY DESC(?totalMatches)
      LIMIT 10
      """

    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    results = sparql.query().convert()
    return JsonResponse(results)

@swagger_auto_schema(
    method='get',
    operation_summary="Get item details",
    operation_description="Get details of an item by its QID. Get the item's title, link to wikipedia, description, image, longitude, latitude, inception, 5 nearby places, 5 places from the same period, etc.",
    manual_parameters=[
        openapi.Parameter(
            name='QID',
            in_=openapi.IN_PATH,
            type=openapi.TYPE_STRING,
            description='The Wikidata item ID of the item for which we want to see the description, image, geolocation, nearby items, etc.',
            required=True
        )
    ],
    responses={
        200: 'Successful Response',
        400: 'Bad Request',
    }
)
@api_view(['GET'])
# Takes the item id as parameter and returns the items details, 5 nearby items, 5 items from same period
def results(request, QID):
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")

    # SPARQL query string with the item as a variable
    query = f"""
    SELECT DISTINCT ?item ?itemLabel ?description ?latitude ?longitude (YEAR(?inception) AS ?inceptionYear) ?styleLabel ?image ?article WHERE {{
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
      OPTIONAL {{
        ?item wdt:P18 ?image.
      }}
  
      OPTIONAL {{
        ?article schema:about ?item;
                schema:isPartOf <https://en.wikipedia.org/>.
      }}
    }}
          LIMIT 1

    """
    # Set the query string and format
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    # Execute the query and parse the results
    results = sparql.query().convert()

    try:
      longitude = float(results['results']['bindings'][0]['longitude']['value'])
      latitude = float(results['results']['bindings'][0]['latitude']['value'])
      nearby_entries = top_5_nearby(longitude, latitude)
    except:
      nearby_entries = {}

    try:
        inception = int(results['results']['bindings'][0]['inceptionYear']['value'])
        same_period_entries = top_5_period(inception)
    except:
        same_period_entries = {}

    final = results
    final['nearby'] = nearby_entries
    final['period'] = same_period_entries
    # final = {'results': results, 'nearby': nearby_entries, 'period': same_period_entries}

    return JsonResponse(final)


# Returns 5 items with the least distance to given longitude and latitude
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
  FILTER(BOUND(?distance))
}}
ORDER BY ?distance
OFFSET 1
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
  FILTER(BOUND(?period) && ?period<150)
}}
ORDER BY ?period
LIMIT 5
"""

    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    results = sparql.query().convert()

    return results
