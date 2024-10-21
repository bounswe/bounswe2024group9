from SPARQLWrapper import SPARQLWrapper, JSON
from .Utils.utils import *
from .Utils.forms import *
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate, get_user_model
from django.contrib.auth.forms import AuthenticationForm
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Question, Comment
from urllib.parse import quote
import requests


# Used for initial search - returns 5 best matching wiki id's
@login_required
def wiki_search(request, search_strings):
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")

    search_terms = search_strings.split()  # split into words

    # Generate SPARQL FILTER for each word in the search string
    filter_conditions = " || ".join(
        [f'CONTAINS(LCASE(?languageLabel), "{quote(term.lower())}")' for term in search_terms])

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
@login_required
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
    info_object = modify_data(wiki_id)
    return info_object


@login_required
def get_run_coder_api_languages(request):
    languages = get_languages()
    
    print(languages)

    if languages is not None:
        return JsonResponse({'languages': languages}, status=200)
    else:
        return JsonResponse({'error': 'Failed to fetch languages'}, status=500)



@csrf_exempt
def signup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password1 = data.get('password1')
            password2 = data.get('password2')
        except (KeyError, json.JSONDecodeError) as e:
            return JsonResponse({'error': f'Malformed data: {str(e)}'}, status=400)

        if password1 != password2:
            return JsonResponse({'error': 'Passwords do not match'}, status=400)

        User = get_user_model()

        # Check if the username or email already exists
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username is already taken'}, status=400)
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email is already registered'}, status=400)

        user = User(username=username, email=email)
        user.set_password(password1)  # It will hash the password
        user.save()

        return JsonResponse({'success': 'User created successfully', 'user_id': user.pk, 'username': user.username}, status=201)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        try:
            # Parse the incoming JSON request body
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
        except (KeyError, json.JSONDecodeError) as e:
            # Handle malformed data
            return JsonResponse({'error': 'Malformed data, error: ' + str(e)}, status=400)

        # Authenticate the user
        user = authenticate(username=username, password=password)
        if user is not None:
            # Authentication successful, log in the user
            login(request, user)
            return JsonResponse({'status': 'success', 'user_id': user.pk}, status=200)
        else:
            # Authentication failed, log the failed attempt and return an error
            print("Failed login attempt for username:", username)
            return JsonResponse({'error': 'Invalid username or password'}, status=400)
    else:
       # Method not allowed if not POST
        return HttpResponse(status=405)

@csrf_exempt  # This is allowing POST requests without CSRF token
@login_required # We are controlling if the user is logged in here
def create_comment(request: HttpRequest) -> HttpResponse:
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            question_id = data.get('question_id')
            comment_details = data.get('details')
            code_snippet = data.get('code_snippet', '')
            language = data.get('language')

            # Fetch the question by its _id (since your model uses _id as the primary key)
            try:
                question = Question.objects.get(_id=question_id)
            except Question.DoesNotExist:
                return JsonResponse({'error': 'Question not found'}, status=404)

            # Get the language ID mapping
            Lang2ID = get_languages()
            language_id = Lang2ID.get(language, None)

            if language_id is None:
                return JsonResponse({'error': 'Invalid language'}, status=400)

            # Create a new comment
            comment = Comment.objects.create(
                details=comment_details,
                code_snippet=code_snippet,
                language_id=language_id,
                author=request.user  # Associate the comment with the logged-in user
            )

            # Associate the comment with the question
            question.comments.add(comment)

            return JsonResponse({'success': 'Comment created successfully', 'comment_id': comment._id}, status=201)

        except (KeyError, json.JSONDecodeError) as e:
            return JsonResponse({'error': f'Malformed data: {str(e)}'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt  
@login_required  
def create_question(request : HttpRequest) -> HttpResponse:
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            title = data.get('title')
            language = data.get('language')
            details = data.get('details')
            code_snippet = data.get('code_snippet', '')  # There may not be a code snippet
            tags = data.get('tags', [])  # There may not be any tags

            Lang2ID = get_languages() #returns NONE why idk 
            language_id = Lang2ID.get(language, None)

            if language_id is None:
                return JsonResponse({'error': 'Invalid language'}, status=400)
        
            question = Question.objects.create(
                title=title,
                language=language,
                language_id=language_id, 
                details=details,
                code_snippet=code_snippet,
                tags=tags,
                author=request.user
            )

            request.user.add_question(question)

            return JsonResponse({'success': 'Question created successfully', 'question_id': question._id}, status=201)

        except (KeyError, json.JSONDecodeError) as e:
            return JsonResponse({'error': f'Malformed data: {str(e)}'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


def list_questions_by_language(request):
    language = request.GET.get('language', None)
    
    if not language:
        return JsonResponse({'error': 'Language parameter is required'}, status=400)
    
    questions = Question.objects.filter(language__iexact=language)
    
    questions_data = [{
        'id': question._id,
        'title': question.title,
        'language': question.language,
        'tags': question.tags,
        'details': question.details,
        'code_snippet': question.code_snippet,
        'upvotes': question.upvotes,
        'creationDate': question.creationDate.strftime('%Y-%m-%d %H:%M:%S'),
    } for question in questions]
    
    return JsonResponse({'questions': questions_data}, safe=False, status=200)

@csrf_exempt
def list_questions_by_tag(request):
    tags = request.GET.get('tag_array', None)
    
    if not tags:
        return JsonResponse({'error': 'Tag parameter is required'}, status=400)
    
    questions = Question.objects.filter(tags__contains=tags)

    questions_data = [{
        'id': question._id,
        'title': question.title,
        'language': question.language,
        'tags': question.tags,
        'details': question.details,
        'code_snippet': question.code_snippet,
        'upvotes': question.upvotes,
        'creationDate': question.creationDate.strftime('%Y-%m-%d %H:%M:%S'),
    } for question in questions]

    return JsonResponse({'questions': questions_data}, safe=False, status=200)


@login_required
@csrf_exempt
def run_code_view(request):
    type = request.GET.get('type', '') # Get type, comment or question
    id = request.GET.get('id', '') # Get id of the comment or question

    if type == 'comment':
        comment = Comment.objects.get(_id=id)
        outs = comment.run_snippet()
    elif type == 'question':
        question = Question.objects.get(_id=id)
        outs = question.run_snippet()
    else:
        return JsonResponse({'error': 'Invalid type'}, status=400)
    return JsonResponse({'output': outs})


def home(request):
    return render(request, 'home.html')


@csrf_exempt
def random_questions(request):
    # Retrieve 5 random questions
    questions = Question.objects.order_by('?')[:5]

    questions_data = [{
        'id': question._id,
        'title': question.title,
        'description': question.details,
        'user_id': question.author.pk,
        'likes': question.upvotes,
        'comments_count': question.comments.count(),
        'programmingLanguage': question.language,
        'codeSnippet': question.code_snippet,
        'tags': question.tags,
        'answered': question.answered,
        'topic': question.topic
    } for question in questions]

    return JsonResponse({'questions': questions_data}, safe=False)


@csrf_exempt
def get_question_comments(request, question_id):
    try:
        question = Question.objects.get(_id=question_id)
        comments = question.comments.all()

        comments_data = [{
            'comment_id': comment._id,
            'details': comment.details,
            'user': comment.author.username,
            'upvotes': comment.upvotes,
        } for comment in comments]

        return JsonResponse({'comments': comments_data}, status=200)
    
    except Question.DoesNotExist:
        return JsonResponse({'error': 'Question not found'}, status=404)
