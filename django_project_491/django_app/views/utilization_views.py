from SPARQLWrapper import SPARQLWrapper, JSON
from ..Utils.utils import *
from ..Utils.forms import *
from django.shortcuts import render
from django.http import  JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from ..models import Question, Comment, VoteType, Question_Vote, Comment_Vote, check_status
from urllib.parse import quote
from django.contrib.contenttypes.models import ContentType



# Used for initial search - returns 5 best matching wiki id's
# @login_required
def wiki_search(request, search_strings):
    """
    Perform a search on Wikidata for languages based on the given search strings.
    Args:
        request (HttpRequest): The HTTP request object.
        search_strings (str): A string containing search terms separated by spaces.
    Returns:
        JsonResponse: A JSON response containing the search results from Wikidata.
                      If an error occurs, a JSON response with an error message and status 500 is returned.
    Raises:
        Exception: If there is an error during the SPARQL query execution.
    Example:
        To search for languages containing the terms "english" and "french":
        wiki_search(request, "english french")
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")

    user_agent = "MyDjangoApp/1.0 (https://example.com/contact)" # manual contact to avoid wikidata
    sparql.addCustomHttpHeader("User-Agent", user_agent)

    search_terms = search_strings.split()  # split into words

    # Generate SPARQL FILTER for each word in the search string
    filter_conditions = " || ".join(
        [f'CONTAINS(LCASE(?languageLabel), "{quote(term.lower())}")' for term in search_terms])

    query = f"""
    SELECT DISTINCT ?language ?languageLabel
    WHERE {{
    # Limit to specific instance types
    VALUES ?instanceType {{ wd:Q9143 wd:Q66747126 wd:Q28455561 wd:Q899523 wd:Q1268980 wd:Q21562092 wd:Q211496 wd:Q12772052}}
    
    # Filter by instance type
    ?language wdt:P31 ?instanceType.
    # Filter for English language labels and check for search terms
    ?language rdfs:label ?languageLabel.
    FILTER(LANG(?languageLabel) = "en")
    FILTER({filter_conditions})  # Use the dynamically constructed filter conditions here
    }}
    ORDER BY STRLEN(?languageLabel)  # Order by the length of the language label
    LIMIT 5
    """

    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    try:
        results = sparql.query().convert()
        return JsonResponse(results)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# Shows the resulting info of the chosen wiki item
def wiki_result(response, wiki_id):
    """
    Retrieve language information from Wikidata and return as a JSON response.

    This view function fetches comprehensive details about a specific language identified by
    its Wikidata ID (`wiki_id`). It performs the following operations:
    1. Executes a SPARQL query to obtain main language information, including labels, Wikipedia links,
        influences, publication and inception dates, and official website.
    2. Executes a second SPARQL query to retrieve instances of the language, excluding programming languages.
    3. For each instance, it fetches related languages, excluding the current language.
    4. Attempts to fetch additional Wikipedia data related to the language.
    5. Combines all retrieved data into a structured JSON response.

    Args:
         response (HttpRequest): The HTTP request object.
         wiki_id (str): The Wikidata identifier for the language (e.g., 'Q1234').

    Returns:
         JsonResponse: A JSON response containing main language information, instances, and Wikipedia data.
    """
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")

    user_agent = "MyDjangoApp/1.0 (https://example.com/contact)" # manual contact to avoid wikidata
    sparql.addCustomHttpHeader("User-Agent", user_agent)

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
    """
    Retrieve and process Wikipedia data based on the provided wiki_id.

    Parameters:
        wiki_id (int): The unique identifier for the Wikipedia entry.

    Returns:
        object: An object containing the processed information.
    """
    info_object = modify_data(wiki_id)
    return info_object


def get_run_coder_api_languages(request):
    """
    Fetches the available programming languages from the Run Coder API and returns them in a JSON response.
    Args:
        request (HttpRequest): The HTTP request object.
    Returns:
        JsonResponse: A JSON response containing the list of programming languages if successful,
                      or an error message if the fetch operation fails.
    """
    languages = get_languages()
    
    if languages is not None:
        return JsonResponse({'languages': languages}, status=200)
    else:
        return JsonResponse({'error': 'Failed to fetch languages'}, status=500)


@csrf_exempt
def run_code_of_question_or_comment(request, type: str, id: int):
    """
    Executes the code snippet associated with a comment or question and returns the output.

    Args:
        request: The HTTP request object.
        type (str): The type of object to run the code for, either 'comment' or 'question'.
        id (int): The ID of the comment or question.

    Returns:
        JsonResponse: A JSON response containing the output of the executed code snippet or an error message if the type is invalid.
    """

    if type == 'comment':
        comment = Comment.objects.get(_id=id)
        outs = comment.run_snippet()
    elif type == 'question':
        question = Question.objects.get(_id=id)
        outs = question.run_snippet()
    else:
        return JsonResponse({'error': 'Invalid type'}, status=400)
    return JsonResponse({'output': outs})


@csrf_exempt
def upvote_object(request, object_type: str, object_id: int):
    """
    Handles the upvoting of a specified object (question or comment) by a user.
    Args:
        request (HttpRequest): The HTTP request object containing headers and other request data.
        object_type (str): The type of the object to be upvoted ('question' or 'comment').
        object_id (int): The ID of the object to be upvoted.
    Returns:
        JsonResponse: A JSON response indicating the success or failure of the upvote operation.
    Raises:
        JsonResponse: If the object_id is not provided, returns a 400 error.
        JsonResponse: If the User-ID header is not provided, returns a 400 error.
        JsonResponse: If the specified object does not exist, returns a 404 error.
        JsonResponse: If the user has already upvoted the object, returns a 400 error.
        JsonResponse: If the object type is invalid, returns a 400 error.
    """
    if not object_id:
        return JsonResponse({'error': 'Object ID parameter is required'}, status=400)
    user_id = request.headers.get('User-ID', None)
    if user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)
    
    user_id = int(user_id)
    user = User.objects.get(pk=user_id)

    # Handle upvote logic based on the object type
    if object_type == 'question':
        try:
            question = Question.objects.get(pk=object_id)
        except Question.DoesNotExist:
            return JsonResponse({'error': f'{object_type.capitalize()} not found'}, status=404)

        # Check for existing upvote
        existing_vote = Question_Vote.objects.filter(user=user, question=question).first()
        if existing_vote:
            if existing_vote.vote_type == VoteType.UPVOTE.value:
                return JsonResponse({'error': 'You have already upvoted this question'}, status=409)
            else:
                # Change existing downvote to upvote 
                existing_vote.vote_type = VoteType.UPVOTE.value
                existing_vote.save()
                question.upvotes += 1
                question.save()
                return JsonResponse({'success': 'Changed downvote to upvote'}, status=200)

        # Create a new upvote
        Question_Vote.objects.create(
            vote_type=VoteType.UPVOTE.value,
            user=user,
            question=question
        )
        question.upvotes += 1
        question.save()
        return JsonResponse({'success': 'Question upvoted successfully'}, status=200)

    elif object_type == 'comment':
        try:
            comment = Comment.objects.get(pk=object_id)
        except Comment.DoesNotExist:
            return JsonResponse({'error': f'{object_type.capitalize()} not found'}, status=404)

        # Check for existing upvote
        existing_vote = Comment_Vote.objects.filter(user=user, comment=comment).first()
        if existing_vote:
            if existing_vote.vote_type == VoteType.UPVOTE.value:
                return JsonResponse({'error': 'You have already upvoted this comment'}, status=409)
            else:
                # Change existing downvote to upvote
                existing_vote.vote_type = VoteType.UPVOTE.value
                existing_vote.save()
                comment.upvotes += 2 # One for resetting the vote and one for the upvote
                comment.save()
                return JsonResponse({'success': 'Changed downvote to upvote'}, status=200)

        # Create a new upvote
        Comment_Vote.objects.create(
            vote_type=VoteType.UPVOTE.value,
            user=user,
            comment=comment
        )
        comment.upvotes += 1
        comment.save()
        return JsonResponse({'success': 'Comment upvoted successfully'}, status=200)

    else:
        return JsonResponse({'error': 'Invalid object type'}, status=400)


@csrf_exempt
def downvote_object(request, object_type: str, object_id: int):
    """
    Handles the downvoting of an object (question or comment) by a user.
    Args:
        request (HttpRequest): The HTTP request object containing headers and other request data.
        object_type (str): The type of object to downvote ('question' or 'comment').
        object_id (int): The ID of the object to downvote.
    Returns:
        JsonResponse: A JSON response indicating the success or failure of the downvote operation.
    Raises:
        JsonResponse: If the object_id is not provided, returns a 400 error.
        JsonResponse: If the User-ID header is not provided, returns a 400 error.
        JsonResponse: If the object (question or comment) does not exist, returns a 404 error.
        JsonResponse: If the user has already downvoted the object, returns a 400 error.
        JsonResponse: If the object type is invalid, returns a 400 error.
    """
    if not object_id:
        return JsonResponse({'error': 'Object ID parameter is required'}, status=400)
    
    user_id = request.headers.get('User-ID', None)
    if user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)
    
    user_id = int(user_id)
    user = User.objects.get(pk=user_id) # Get the logged-in user

    # Handle downvote logic based on the object type
    if object_type == 'question':
        try:
            question = Question.objects.get(pk=object_id)
        except Question.DoesNotExist:
            return JsonResponse({'error': f'{object_type.capitalize()} not found'}, status=404)

        # Check for existing downvote
        existing_vote = Question_Vote.objects.filter(user=user, question=question).first()
        if existing_vote:
            if existing_vote.vote_type == VoteType.DOWNVOTE.value:
                return JsonResponse({'error': 'You have already downvoted this question'}, status=400)
            else:
                # Change existing upvote to downvote
                existing_vote.vote_type = VoteType.DOWNVOTE.value
                existing_vote.save()
                question.upvotes -= 1
                question.save()
                return JsonResponse({'success': 'Changed upvote to downvote'}, status=200)

        # Create a new downvote
        Question_Vote.objects.create(
            vote_type=VoteType.DOWNVOTE.value,
            user=user,
            question=question
        )
        question.upvotes -= 1
        question.save()
        return JsonResponse({'success': 'Question downvoted successfully'}, status=200)

    elif object_type == 'comment':
        try:
            comment = Comment.objects.get(pk=object_id)
        except Comment.DoesNotExist:
            return JsonResponse({'error': f'{object_type.capitalize()} not found'}, status=404)

        # Check for existing downvote
        existing_vote = Comment_Vote.objects.filter(user=user, comment=comment).first()
        if existing_vote:
            if existing_vote.vote_type == VoteType.DOWNVOTE.value:
                return JsonResponse({'error': 'You have already downvoted this comment'}, status=400)
            else:
                # Change existing upvote to downvote
                existing_vote.vote_type = VoteType.DOWNVOTE.value
                existing_vote.save()
                comment.upvotes -= 1
                comment.save()
                return JsonResponse({'success': 'Changed upvote to downvote'}, status=200)

        # Create a new downvote
        Comment_Vote.objects.create(
            vote_type=VoteType.DOWNVOTE.value,
            user=user,
            comment=comment
        )
        comment.upvotes -= 1
        comment.save()
        return JsonResponse({'success': 'Comment downvoted successfully'}, status=200)

    else:
        return JsonResponse({'error': 'Invalid object type'}, status=400)


def home(request):
    return render(request, 'home.html')


# Will be removed in the final version.
@csrf_exempt
def post_sample_code(request):
    
    data = json.loads(request.body)

    source_code = data.get('source_code', '')  # Get 'code' from the JSON body
    language_id = data.get('language_id', 71)  # Default to Python

    result = run_code(source_code, language_id)
    print(result)
    outs = []
    if result['stderr']:
        outs = [result['stderr']]

    elif result['status']['id'] != 3 and result['status']['id'] != 4:
        outs = [check_status(result['status'])]

    elif result['stdout'] is None:
        outs =  ["NO OUTPUT for STDOUT"]

    else:
        outs = result['stdout'].split('\n')
    return JsonResponse({'output': outs, 'status': result['status']})

