import requests
import time
import json
import os
from dotenv import load_dotenv
import xml.etree.ElementTree as ET
from django.core.cache import cache
import random

JUDGE_API_KEY_POOL = os.environ.get('JUDGE0_API_KEY_POOL').split(',')
JUDGE_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions'

UNSUCCESSFUL_KEYS = set()
print(JUDGE_API_KEY_POOL)
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


def choose_api_key():
    """
    Chooses a key from the pool, prioritizing successful keys.
    If all keys fail, resets the pool after exhausting all available options.
    """
    global UNSUCCESSFUL_KEYS
    
    if UNSUCCESSFUL_KEYS:
        temp_pool = JUDGE_API_KEY_POOL.copy()
        # Remove unsuccessful keys from the temporary pool
        temp_pool = [key for key in temp_pool if key not in UNSUCCESSFUL_KEYS]
        
        if not temp_pool:
            # If all keys have failed, reset unsuccessful keys and try again
            UNSUCCESSFUL_KEYS.clear()
            print("All keys have been exhausted, resetting key pool.")
            raise Exception("All keys have been exhausted")
        
        return random.choice(temp_pool)
    else:
        return random.choice(JUDGE_API_KEY_POOL)

def request_with_key_rotation(url, method="GET", data=None, max_retries=3) -> tuple:
    """
    Makes an HTTP request with key rotation on 429 (rate limit) errors.
    Supports both GET and POST requests. Automatically manages key rotation on failures.
    """
    for _ in range(max_retries):
        key = choose_api_key()
        headers = {
            "X-RapidAPI-Key": key,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "content-type": "application/json"
        }

        # Perform request based on method type
        if method == "POST":
            response = requests.post(url, headers=headers, data=json.dumps(data))
        else:
            response = requests.get(url, headers=headers)

        if response.status_code in [200, 201]:
            print("Request successful.")
            UNSUCCESSFUL_KEYS.clear() 
            return response.json() , key
        elif response.status_code == 429:
            print(f"Rate limit hit for key {key}, rotating key...")
            UNSUCCESSFUL_KEYS.add(key)  # Mark this key as unsuccessful
            time.sleep(1)  # Delay before retrying with a new key
        else:
            print(f"Error {response.status_code}: {response.text}")
            UNSUCCESSFUL_KEYS.clear()  # Reset unsuccessful keys
            return None, None
    
    print("All retries exhausted.")
    UNSUCCESSFUL_KEYS.clear() 
    return None, None



def create_execution_submission(source_code, language_id, max_retries=3):
    """
    Submit code to Judge0 API for execution with automatic key rotation on failure.
    Uses request_with_key_rotation to handle key rotation.
    """
    data = {
        "source_code": source_code,
        "language_id": language_id,  # Language ID according to Judge0 docs (e.g., 71 for Python)
        "stdin": "",  # You can pass inputs for the program here
        "expected_output": "",  # Optionally, specify expected output
        "cpu_time_limit": "2",  # Optional settings for execution
    }

    # Call request_with_key_rotation with the POST method
    response, api_key = request_with_key_rotation(JUDGE_API_URL, method="POST", data=data, max_retries=max_retries)

    # Process the response
    if response and "token" in response:
        submission_token = response["token"]
        print(f"Submission created successfully. Token: {submission_token}")
        return submission_token, api_key
    else:
        print("Error creating submission or max retries exhausted.")
        return None, None

def get_execution_submission_result(token, used_api_key):
    """
    Poll the Judge0 API to get the result of the submission.
    """
    result_url = f"{JUDGE_API_URL}/{token}"

    headers = {
        "X-RapidAPI-Key": used_api_key,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        "content-type": "application/json"
    }

    while True:
        response = requests.get(result_url, headers=headers)
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


def run_code(source_code, language_id):
    token, used_api_key = create_execution_submission(source_code, language_id)
    if token:
        return get_execution_submission_result(token, used_api_key)
    else:
        raise Exception("Error creating submission")

def get_languages():
    """
    Retrieves supported languages from Judge0 API, with key rotation on 429 errors.
    """
    Lang2ID = cache.get('Lang2ID')
    if Lang2ID is not None:
        return Lang2ID

    url = 'https://judge0-ce.p.rapidapi.com/languages'
    response, _ = request_with_key_rotation(url, method="GET")
    if response:
        Lang2ID = {lang['name']: lang['id'] for lang in response}
        cache.set('Lang2ID', Lang2ID, timeout=None)  # Cache indefinitely
        return Lang2ID
    else:
        print("Failed to fetch languages.")
        return None


