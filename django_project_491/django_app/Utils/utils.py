import requests
import time
import json
import os
from dotenv import load_dotenv


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
    load_dotenv()
    print(os.environ.get('JUDGE0_API_KEY'))

    HEADERS = {
        "content-type": "application/json",
        "X-RapidAPI-Key": os.environ.get('JUDGE0_API_KEY'),
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
    }

    token = create_submission(source_code, language_id)
    if token:
        return get_submission_result(token)
    else:
        raise Exception("Error creating submission")