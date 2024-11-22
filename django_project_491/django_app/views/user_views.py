from ..models import UserType, User, Question
from django.contrib.auth import login, authenticate, get_user_model
from django.http import HttpRequest, HttpResponse, JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import permission_classes, api_view
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.permissions import IsAuthenticated
from django_ratelimit.decorators import ratelimit
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.hashers import make_password
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import os 

@csrf_exempt
def get_user_profile_by_username(request, username : str) -> JsonResponse:
    """
    Retrieve user profile information by username.
    Args:
        request (HttpRequest): The HTTP request object.
        username (str): The username of the user whose profile is to be retrieved.
    Returns:
        JsonResponse: A JSON response containing the user's profile information if found,
                    or an error message if the username is not provided or the user does not exist.
    Raises:
        User.DoesNotExist: If no user with the given username exists.
    """
    if not username:
        return JsonResponse({'error': 'Username parameter is required'}, status=400)
    
    user : User = get_user_model().objects.get(username=username)
    
    user_data = {
        'username': user.username,
        'email': user.email,
        'questions': user.get_question_details(),
        'comments': user.get_comment_details(),
        'bookmarks': user.get_bookmark_details(),
        'profile_pic': user.profile_pic.url if user.profile_pic else None,
        'bio': user.bio,
        'interested_topics': user.interested_topics,
        'known_languages': user.known_languages,
        'name': user.name,
        'surname': user.surname
    }
    
    return JsonResponse({'user': user_data}, status=200)

@csrf_exempt
def get_user_profile_by_id(request, user_id : int) -> JsonResponse:
    """
        Retrieve the profile information of a user by their ID.
        Args:
            request: The HTTP request object.
            user_id (int): The ID of the user whose profile is to be retrieved.
        Returns:
            JsonResponse: A JSON response containing the user's profile information or an error message.
        Raises:
            User.DoesNotExist: If no user with the given ID exists.
        Response JSON Structure:
            {
                'user': {
                    'username': str,
                    'email': str,
                    'questions': list,
                    'comments': list,
                    'bookmarks': list,
                    'profile_pic': str or None,
                    'bio': str,
                    'interested_topics': list,
                    'known_languages': list,
                    'name': str,
                    'surname': str
        """
    if not user_id:
        return JsonResponse({'error': 'User ID parameter is required'}, status=400)
    
    user : User = get_user_model().objects.get(pk=user_id)
    
    user_data = {
        'username': user.username,
        'email': user.email,
        'questions': user.get_question_details(),
        'comments': user.get_comment_details(),
        'bookmarks': user.get_bookmark_details(),
        'profile_pic': user.profile_pic.url if user.profile_pic else None,
        'bio': user.bio,
        'interested_topics': user.interested_topics,
        'known_languages': user.known_languages,
        'name': user.name,
        'surname': user.surname
    }
    
    return JsonResponse({'user': user_data}, status=200)

#TODO find what can be changed in the user profile.
@csrf_exempt
def edit_user_profile(request, will_be_edited_user_id : int) -> JsonResponse:
    def edit_user_profile(request, will_be_edited_user_id: int) -> JsonResponse:
        """
        Edits the user profile based on the provided user ID and request data.
        Args:
            request: The HTTP request object containing headers and body data.
            will_be_edited_user_id (int): The ID of the user whose profile will be edited.
        Returns:
            JsonResponse: A JSON response indicating the success or failure of the profile update.
        Raises:
            JsonResponse: If the 'User-ID' header is missing or invalid, or if the user does not have permission to edit the profile.
        Notes:
            - Only admins and the owner of the profile can edit user profiles.
            - The request body should contain the fields to be updated (e.g., 'username', 'email', 'bio', 'profile_pic').
        """
    wants_to_edit_user_id = request.headers.get('User-ID', None)
    if wants_to_edit_user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)
    wants_to_edit_user_id = int(wants_to_edit_user_id)

    if not will_be_edited_user_id:
        return JsonResponse({'error': 'User ID parameter is required'}, status=400)
    
    if not wants_to_edit_user_id:
        return JsonResponse({'error': 'User ID parameter is required'}, status=403)

    will_be_edited_user : User = get_user_model().objects.get(pk=will_be_edited_user_id)
    wants_to_edit_user : User = get_user_model().objects.get(pk=wants_to_edit_user_id)

    if wants_to_edit_user.userType != UserType.ADMIN and wants_to_edit_user_id != will_be_edited_user_id:
        return JsonResponse({'error': 'Only admins and owner of the profiles can edit user profiles'}, status=403)


    data = json.loads(request.body)
    
    #TODO find what can be changed in the user profile. Maybe adding profile picture, bio, etc.
    if 'username' in data:
        will_be_edited_user.username = data['username']
    if 'email' in data:
        will_be_edited_user.email = data['email']
    if 'bio' in data:
        will_be_edited_user.bio = data['bio']
    if 'profile_pic' in data:
        will_be_edited_user.profile_pic = data['profile_pic']

    
    will_be_edited_user.save()
    
    return JsonResponse({'success': 'User profile updated successfully'}, status=200)

@csrf_exempt
def delete_user_profile(request, will_be_deleted_user_id: int) -> JsonResponse:
    """
    Deletes a user profile based on the provided user ID.
    Args:
        request: The HTTP request object containing headers and other request data.
        will_be_deleted_user_id (int): The ID of the user profile to be deleted.
    Returns:
        JsonResponse: A JSON response indicating the success or failure of the deletion operation.
    Raises:
        JsonResponse: If the 'User-ID' header is not provided in the request, a 400 status code is returned.
        JsonResponse: If the user attempting to delete the profile is not an admin or the owner of the profile, a 403 status code is returned.
        JsonResponse: If the user ID to be deleted is not provided, a 400 status code is returned.
    """

    wants_to_delete_user_id = request.headers.get('User-ID', None)
    if wants_to_delete_user_id is None:
        return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)

    wants_to_delete_user_id = int(wants_to_delete_user_id)

    if not will_be_deleted_user_id:
        return JsonResponse({'error': 'User ID parameter is required'}, status=400)
    
    

    wants_to_delete_user: User = get_user_model().objects.get(pk=wants_to_delete_user_id)
    
    if (wants_to_delete_user.userType != UserType.ADMIN) and (int(wants_to_delete_user_id) != will_be_deleted_user_id):
        return JsonResponse({'error': 'Only admins and owner of the profiles can delete user profiles'}, status=403)
    

    will_be_deleted_user = get_user_model().objects.get(pk=will_be_deleted_user_id)
    
    will_be_deleted_user.delete()
    
    return JsonResponse({'success': 'User profile deleted successfully'}, status=200)


@csrf_exempt
def signup(request):
    """
    Handle user signup requests.

    This view handles POST requests to create a new user account. It expects a JSON payload with the following fields:
    - username: The desired username for the new account.
    - email: The email address for the new account.
    - password1: The desired password for the new account.
    - password2: Confirmation of the desired password.

    The view performs the following checks:
    - Ensures the request method is POST.
    - Validates that the JSON payload is correctly formatted.
    - Ensures that the passwords match.
    - Checks if the username or email already exists in the database.

    If all checks pass, the view creates a new user, hashes the password, and saves the user to the database. It then attempts to authenticate and log in the user, returning a success response with the user's ID, username, and authentication token.

    If any checks fail, or if there is an error during user creation or authentication, the view returns an appropriate error response.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        JsonResponse: A JSON response indicating the result of the signup attempt.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username').strip().lower()
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
        # Authenticate the user
        user = authenticate(username=username, password=password1)
        if user is not None:
            # Authentication successful, log in the user
            login(request, user)
            refresh = RefreshToken.for_user(user)

            return JsonResponse({'success': 'User created and logged in successfully', 'user_id': user.pk, 'username': user.username, 'token': str(refresh.access_token)}, status=201)
        else:
            return JsonResponse({'error': 'User created but failed to authenticate'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)



@csrf_exempt
def login_user(request : HttpRequest) -> HttpResponse:
    """
    Handles user login requests.

    This view function processes POST requests to log in a user. It expects a JSON
    payload with 'username' and 'password' fields. If the credentials are valid,
    the user is authenticated and logged in, and a JSON response with a success
    status, user ID, and access token is returned. If the credentials are invalid,
    an error message is returned. For non-POST requests, a 405 Method Not Allowed
    response is returned.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponse: A JSON response with the login status, user ID, and access
        token if successful, or an error message if the login fails.
    """
    if request.method == 'POST':
        try:
            # Parse the incoming JSON request body
            data = json.loads(request.body)
            username = data.get('username').strip().lower()
            password = data.get('password')
        except (KeyError, json.JSONDecodeError) as e:
            # Handle malformed data
            return JsonResponse({'error': 'Malformed data, error: ' + str(e)}, status=400)

        # Authenticate the user
        user = authenticate(username=username, password=password)
        if user is not None:
            # Authentication successful, log in the user
            login(request, user)
            refresh = RefreshToken.for_user(user)
            return JsonResponse({'status': 'success', 'user_id': user.pk, 'token': str(refresh.access_token)}, status=200)
        else:
            # Authentication failed, log the failed attempt and return an error
            print("Failed login attempt for username:", username)
            return JsonResponse({'error': 'Invalid username or password'}, status=400)
    else:
       # Method not allowed if not POST
        return HttpResponse(status=405)


@csrf_exempt
def add_interested_languages_for_a_user(request):
    """
    Handle POST request to update a user's interested topics and known languages.
    This view function expects a JSON payload in the request body with the following structure:
    {
        "user_id": <int>,
        "interested_topics": <list>,
        "known_languages": <list>
    }
    Args:
        request (HttpRequest): The HTTP request object.
    Returns:
        JsonResponse: A JSON response indicating success or failure.
            - On success: {'success': 'Interested languages updated successfully'}, status=200
            - On failure: {'error': 'Invalid request method'}, status=405
    """
    if request.method == 'POST':
        data = json.loads(request.body)
        user_id = data.get('user_id')
        user : User = get_user_model().objects.get(pk=user_id)
    
        user.interested_topics = data.get('interested_topics', [])
        user.known_languages = data.get('known_languages', [])
        user.save()
        return JsonResponse({'success': 'Interested languages updated successfully'}, status=200)
    return JsonResponse({'error': 'Invalid request method'}, status=405)



@csrf_exempt
def get_user_preferred_languages(request):
    """
    Retrieve the preferred languages and interested topics of a user.

    Args:
        request (HttpRequest): The HTTP request object containing the user ID in the body.

    Returns:
        JsonResponse: A JSON response containing the user's known languages and interested topics.

    Raises:
        User.DoesNotExist: If no user is found with the given user ID.
        json.JSONDecodeError: If the request body is not a valid JSON.
    """
    data = json.loads(request.body)
    user_id = data.get('user_id')
    user : User = get_user_model().objects.get(pk=user_id)
    return JsonResponse({'known_languages': user.known_languages, 'interested_topics': user.interested_topics}, status=200)

@api_view(['POST'])
def logout_user(request: HttpRequest) -> HttpResponse:
    """
    Logs out a user by blacklisting their refresh token.

    This view handles POST requests to log out a user. It expects a JSON body
    containing a "token" field with the user's refresh token. The refresh token
    is then blacklisted to invalidate it, effectively logging the user out.

    Args:
        request (HttpRequest): The HTTP request object containing the refresh token.

    Returns:
        HttpResponse: A JSON response indicating the success or failure of the logout operation.
        - On success: {'status': 'success', 'message': 'User logged out successfully'} with status 200.
        - On failure: {'error': 'Error message'} with status 400.
    """
    try:
        # Extract the refresh token from the request body
        refresh_token = request.data.get("token")
        if not refresh_token:
            return JsonResponse({'error': 'Refresh token required'}, status=400)

        # Create a RefreshToken object and blacklist it
        token = RefreshToken(refresh_token)
        token.blacklist()  # This invalidates the refresh token

        return JsonResponse({'status': 'success', 'message': 'User logged out successfully'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_token(request):
    """
    Check if the provided token is valid.

    This view is protected by authentication and permission classes.
    It returns a JSON response indicating the validity of the token.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        JsonResponse: A JSON response with a status message.
    """
    return JsonResponse({'status': 'Token is valid'}, status=200)

@csrf_exempt
def upload_profile_pic(request : HttpRequest) -> HttpResponse:
    """
    Handles the upload of a user's profile picture.
    This view function processes POST requests to upload a profile picture for a user.
    The user ID must be provided in the request headers, and the profile picture file
    must be included in the request files.
    Args:
        request (HttpRequest): The HTTP request object.
    Returns:
        HttpResponse: A JSON response indicating success or failure of the upload operation.
        - On success: Returns a JSON response with a success message and the URL of the uploaded profile picture.
        - On failure: Returns a JSON response with an error message and an appropriate HTTP status code.
    Raises:
        User.DoesNotExist: If no user with the provided user ID exists.
    """
    if request.method == 'POST':
        user_id = request.headers.get('User-ID', None)
        if user_id is None:
            return JsonResponse({'error': 'User ID parameter is required in the header'}, status=400)
        
        user_id = int(user_id)
        user : User = get_user_model().objects.get(pk=user_id)

        profile_pic = request.FILES.get('profile_pic')
        user.profile_pic = profile_pic
        user.save()
        return JsonResponse({'success': 'Profile picture uploaded successfully', 'url': user.profile_pic.url}, status=200)
    return JsonResponse({'error': 'Invalid request method'}, status=405)



@csrf_exempt
# @ratelimit(key='ip', rate='5/m', method='POST', block=True) # For now do not use this decorator
def reset_password_request_mail(request : HttpRequest):
    """
    Handles password reset requests.

    This view function processes POST requests to initiate a password reset for a user.
    It expects a JSON payload containing the user's email address. If a user with the
    provided email exists, it generates a password reset token and sends a reset link
    to the user's email.

    Decorators:
        @csrf_exempt: Exempts this view from CSRF verification.
        @ratelimit: Limits the rate of POST requests to 5 per minute per IP address.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        JsonResponse: A JSON response indicating the result of the request. Possible responses:
            - {'message': 'Password reset link sent to your email.'} with status 200 if successful.
            - {'error': 'No user found with this email.'} with status 404 if the email does not match any user.
            - {'error': 'Invalid request method.'} with status 400 if the request method is not POST.
    """
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({'error': 'No user found with this email.'}, status=404)

        # Generate a password reset token and a link
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        frontend_url = os.getenv('REACT_APP_FRONTEND_URL', 'http://localhost:3000')

        reset_link = f"{request.scheme}://{frontend_url}/reset_password/{uid}/{token}/"

        # Render the email content using the template
        html_message = render_to_string('password_reset_email.html', {'reset_link': reset_link})
        plain_message = strip_tags(html_message)  # Strip HTML tags for plain text fallback

        # Send the reset link via email
        send_mail(
            subject='Password Reset Request',
            message=plain_message, # Plain text version of the message
            html_message=html_message,  # HTML version of the message
            from_email='no-reply@example.com',
            recipient_list=[user.email],
            fail_silently=False,
        )

        return JsonResponse({'message': 'Password reset link sent to your email.'})

    return JsonResponse({'error': 'Invalid request method.'}, status=400)

@csrf_exempt
def reset_password(request, uidb64, token):
    """
    Handle the password reset process for a user.
    This view verifies the provided token and user ID, and if valid, allows the user to reset their password.
    Args:
        request (HttpRequest): The HTTP request object.
        uidb64 (str): The base64 encoded user ID.
        token (str): The password reset token.
    Returns:
        JsonResponse: A JSON response indicating the result of the password reset process.
            - If the token and user ID are valid and the request method is POST with matching passwords,
              returns a success message.
            - If the request method is GET, redirects the user to the password reset form.
            - If the passwords do not match or are invalid, returns an error message with status 400.
            - If the token is invalid or expired, returns an error message with status 400.
    """
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        if request.method == 'POST':
            data = json.loads(request.body) 
            new_password = data.get('new_password')
            confirm_password = data.get('confirm_password')
            
            if new_password and new_password == confirm_password:
                user.password = make_password(new_password)
                user.save()
                return JsonResponse({'message': 'Password has been reset successfully.'})
            else:
                return JsonResponse({'error': 'Passwords do not match or are invalid.'}, status=400)
        
        if request.method == 'GET':
            return JsonResponse({'message': 'Redirect to password reset form', 'uid': uidb64, 'token': token})

    return JsonResponse({'error': 'Invalid or expired token.'}, status=400)

@csrf_exempt
def list_most_contributed_five_person(request: HttpRequest) -> JsonResponse:
    """
    List the top five users with the highest contribution points.
    Contribution points are calculated based on:
    - Questions authored by the user: 2 points each
    - Comments authored by the user: 5 points if the comment is an answer to a question, otherwise 1 point
    Args:
        request (HttpRequest): The HTTP request object.
    Returns:
        JsonResponse: A JSON response containing a list of the top five users with their username, email, name, surname, and contribution points.
    """
    users = User.objects.all()

    # Question 2 point, Comment 1 point, Answer 5 point
    def calculate_contribution_points(user):
        question_points = len(user.questions.all()) * 2
        comment_points = sum(5 if comment.answer_of_the_question else 1 for comment in user.authored_comments.all())
        return question_points + comment_points

    users = sorted(users, key=calculate_contribution_points, reverse=True)
    users = users[:5]
    
    user_data = []
    for user in users:
        user_data.append({
            'username': user.username,
            'email': user.email,
            'name': user.name,
            'surname': user.surname,
            'contribution_points': calculate_contribution_points(user)  # Optionally include the contribution score
        })
    
    return JsonResponse({'users': user_data}, status=200)
