import requests
import time
import json
import os
from dotenv import load_dotenv
import xml.etree.ElementTree as ET

load_dotenv()

HEADERS = {
    "content-type": "application/json",
    "X-RapidAPI-Key": os.environ.get('JUDGE0_API_KEY'),
    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
}

JUDGE0_KEY_CHANGED = False


def check_api_key(response):
    def change_api_key():
        HEADERS["X-RapidAPI-Key"] = os.environ.get('ALTERNATIVE_JUDGE0_API_KEY')

    if response.status_code == 429:
        global JUDGE0_KEY_CHANGED
        if not JUDGE0_KEY_CHANGED:
            change_api_key()
            JUDGE0_KEY_CHANGED = True
            return True
    return False


def modify_data(qid):
    # Wikidata API URL to fetch the Wikipedia title
    url = f"https://www.wikidata.org/w/api.php?action=wbgetentities&format=xml&props=sitelinks&ids={qid}&sitefilter=enwiki".format(
        qid)

    response = requests.get(url)
    root = ET.fromstring(response.content)
    title = root.find(".//sitelink").attrib['title']

    # Wikipedia API URL to fetch the content of the page
    wiki_url = f"https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&format=json&titles={title}"
    wiki_response = requests.get(wiki_url).json()
    pages = wiki_response['query']['pages']
    page_id = list(pages.keys())[0]
    content = pages[page_id]['extract']

    # Use only first 2 paragraphs
    content = content.split("\n")
    info = content[:3]
    format_info = "\n".join(info)

    return {"title": title, "info": format_info}


def run_code(source_code, language_id):
    def create_submission(source_code, language_id):
        """
        Submit code to Judge0 API for execution.
        """
        data = {
            "source_code": source_code,
            "language_id": language_id,  # Language ID according to Judge0 docs (e.g., 71 for Python)
            "stdin": "",  # You can pass inputs for the program here
            "expected_output": "",  # Optionally, specify expected output
            "cpu_time_limit": "2",  # Optional settings for execution
        }

        response = requests.post(API_URL, headers=HEADERS, data=json.dumps(data))

        if response.status_code == 201:
            submission_token = response.json()["token"]
            print(f"Submission created successfully. Token: {submission_token}")
            return submission_token
        else:
            if check_api_key(response):
                return create_submission(source_code, language_id)
            print(f"Error creating submission: {response.status_code}, {response.text}")
            return None

    def get_submission_result(token):
        """
        Poll the Judge0 API to get the result of the submission.
        """
        result_url = f"{API_URL}/{token}"

        while True:
            response = requests.get(result_url, headers=HEADERS)
            if response.status_code == 200:
                result = response.json()
                if result["status"]["id"] in [1, 2]:  # Status 1 or 2 indicates still processing
                    print("Code still running... checking again.")
                    time.sleep(1)  # Wait before polling again
                else:
                    return result  # Return the result once execution finishes
            else:
                print(f"Error fetching result: {response.status_code}, {response.text}")
                break

    API_URL = 'https://judge0-ce.p.rapidapi.com/submissions'

    token = create_submission(source_code, language_id)
    if token:
        return get_submission_result(token)
    else:
        raise Exception("Error creating submission")
