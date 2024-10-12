from SPARQLWrapper import SPARQLWrapper, JSON
import requests
import xml.etree.ElementTree as ET

# Query to get the Q-IDs of languages
sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
query = """
SELECT DISTINCT ?language (STRAFTER(STR(?language), "http://www.wikidata.org/entity/") AS ?qid) WHERE {
  ?language wdt:P31 wd:Q9143.
  OPTIONAL { ?language wdt:P737 ?influencedBy. }
}
LIMIT 20
"""
# 
sparql.setQuery(query)
sparql.setReturnFormat(JSON)
results = sparql.query().convert()

# Extract Q-IDs into a list
qids = [result['qid']['value'] for result in results['results']['bindings']]

for qid in qids:
    # Wikidata API URL to fetch the Wikipedia title
    url = f"https://www.wikidata.org/w/api.php?action=wbgetentities&format=xml&props=sitelinks&ids={qid}&sitefilter=enwiki".format(qid)

    response = requests.get(url)
    root = ET.fromstring(response.content)
    title = root.find(".//sitelink").attrib['title']

    print(f"Wikipedia title: {title}")

    # Wikipedia API URL to fetch the content of the page
    wiki_url = f"https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&format=json&titles={title}"
    wiki_response = requests.get(wiki_url).json()
    pages = wiki_response['query']['pages']
    page_id = list(pages.keys())[0]
    content = pages[page_id]['extract']

    # Use only first 2 paragraphs
    content = content.split("\n")
    info = content[:2]
    print("\n".join(info))