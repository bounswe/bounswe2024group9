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


@login_required
def wikidata_query_view(request):
    # search_string = request.GET.get('search', '').split()  # Assuming 'search' is passed as a query parameter
    # filter_conditions = " && ".join([f'CONTAINS(LCASE(?itemLabel), "{term.lower()}")' for term in search_string])
    # subqueries = "\n".join([f'BIND( IF(CONTAINS(LCASE(?itemLabel), "{term.lower()}"), 1, 0) AS ?match_{i})' for i, term in enumerate(search_string)])

    query = f"""
        SELECT ?language ?languageLabel WHERE {{
  ?language wdt:P31 wd:Q9143.  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}  
}}
LIMIT 10
    """
    # 'programming language' (Q9143)
    sparql = SPARQLWrapper("https://query.wikidata.org/sparql")
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)

    try:
        results = sparql.query().convert()
        return JsonResponse(results)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@login_required
def run_code_view(request):
    # TODO Uncomment the lines after connecting to the front-end

    # source_code = request.POST.get('source_code', '')
    # language_id = request.POST.get('language_name', '')

    # TODO Example usage, delete this part after connecting to the front-end
    source_code = "print('Hello, World!')"
    language_id = 71  # Language ID for Python

    result = run_code(source_code, language_id)
    return JsonResponse(result)


def wikipedia_data_views(request):
    qid = "Q28865"  # (temporary) Q-ID for Python
    info_object = modify_data(qid)
    return render(request, 'wikipedia_data.html', {'language': info_object})
  

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

        return JsonResponse({'success': 'User created successfully'}, status=201)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)

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
def create_comment(request : HttpRequest) -> HttpResponse:
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            question_id = data.get('question_id')
            comment_details = data.get('details')
            code_snippet = data.get('code_snippet', '')  # It is optional

            # Fetch the question
            try:
                question = Question.objects.get(_id=question_id)
            except Question.DoesNotExist:
                return JsonResponse({'error': 'Question not found'}, status=404)

            # Create the comment
            comment = Comment.objects.create(details=comment_details, code_snippet=code_snippet)

            # Associate the comment with the question and the user
            question.add_comment(comment)
            request.user.add_comment(comment)

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

            # TODO: ASSIGN LANGUAGE ID dynamically
            language_id = 71  # Language ID for Python

            question = Question.objects.create(
                title=title,
                language=language,
                language_id=language_id, 
                details=details,
                code_snippet=code_snippet,
                tags=tags
            )

            request.user.add_question(question)

            return JsonResponse({'success': 'Question created successfully', 'question_id': question._id}, status=201)

        except (KeyError, json.JSONDecodeError) as e:
            return JsonResponse({'error': f'Malformed data: {str(e)}'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


def list_questions_by_language(request):
    # Get the language parameter from the HTTP GET request
    language = request.GET.get('language', None)
    
    # Check if the language parameter is provided
    if not language:
        return JsonResponse({'error': 'Language parameter is required'}, status=400)
    
    # Fetch questions related to the provided language
    questions = Question.objects.filter(language__iexact=language)
    
    # Convert the questions data to JSON format
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
    
    # Return the questions data as JSON
    return JsonResponse({'questions': questions_data}, safe=False, status=200)

def home(request):
    return render(request, 'home.html')