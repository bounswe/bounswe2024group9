import json
from django.test import TestCase
from .Utils.utils import run_code
from .views.utilization_views import wiki_result, wiki_search
from django.utils import timezone
from .models import User, Comment, Question, Comment_Vote, Question_Vote, UserType, VoteType

from django.urls import reverse

# class TestRunCode(TestCase):
#     # def setUp(self):
#     #     # Create a sample user for testing
#     #     self.user = User.objects.create_user(
#     #         username='testuser',
#     #         email="test",
#     #         password='testpassword'
#     #     )
#     #
#     # def test_run_code(self):
#     #     # Test the run_code function with a simple Python code
#     #     self.client.login(username='testuser', email='test', password='testpassword')
#     #
#     #     response = self.client.post('/run_code/', {
#     #         'source_code': 'print("Hello, World!")',
#     #         'language_name': 'Python (3.8.1)'})
#     #
#     #     self.assertEqual(response.status_code, 200)
#     #     self.assertTrue('stdout' in response.json())
#     #     self.assertTrue(response.json()['stdout'].startswith('Hello, World!'))
#     #
#     # def test_authentication(self):
#     #     response = self.client.get('/run_code/', {
#     #         'source_code': 'print("Hello, World!")',
#     #         'language_name': 'Invalid Language Name'})
#     #     self.assertEqual(response.status_code, 302)  # Redirect to login page
#


class TestSearchResult(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        self.client.login(username='testuser', password='testpassword')  # Log in the test user

    def test_wiki_search_found(self):
            search_strings = 'Python Java' # Valid search string

            url = reverse('wiki_search', kwargs={'search_strings': search_strings})
            response = self.client.get(url)

            self.assertEqual(response.status_code, 200)
            response_json = response.json()
            self.assertGreater(len(response_json['results']), 0)
            self.assertIn('Python', [page['languageLabel']['value'] for page in response_json['results']['bindings']])
            self.assertIn('Java', [page['languageLabel']['value'] for page in response_json['results']['bindings']])

    def test_search_invalid(self):
        search_strings = 'this_is_not_a_language_1234' # Invalid search string

        url = reverse('wiki_search', kwargs={'search_strings': search_strings})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertTrue(response_json['results']['bindings'] == [])  # Empty bindings response expected

    def test_result_valid(self):
        wiki_id = "Q15777" # C programming language

        url = reverse('wiki_result', kwargs={'wiki_id': wiki_id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertTrue(response_json['mainInfo'][0]['languageLabel']['value'] == 'C')
        self.assertTrue(response_json['mainInfo'][0]['website']['value'] == 'https://www.iso.org/standard/74528.html')
        self.assertTrue(response_json['wikipedia']['title'] == 'C (programming language)')

    def test_result_invalid(self):
        wiki_id = "Qabc" # Invalid programming language

        url = reverse('wiki_result', kwargs={'wiki_id': wiki_id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertTrue(response_json['mainInfo'] == [])
        self.assertTrue(response_json['wikipedia'] == [])
        self.assertTrue(response_json['instances'] == [])

class CodeExecutionTests(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser', 
            email='test@example.com', 
            password='testpassword'
        )
    def test_post_sample_code(self):
        # Log in with the test user
        self.client.login(username='testuser', password='testpassword')

        # Define source code and language ID for Python
        source_code = 'print("Hello, World!")'
        language_id = 71  # ID for Python 3.8 in Judge0

        # Send a POST request to post_sample_code endpoint
        response = self.client.post(
            reverse('code_execute'),  
            data=json.dumps({
                'source_code': source_code,
                'language_id': language_id
            }),
            content_type='application/json'
        )

        # Validate response status and content
        self.assertEqual(response.status_code, 200)
        response_json = response.json()
        self.assertIn('stdout', response_json)
        self.assertTrue(response_json['stdout'].startswith('Hello, World!'))

class CommentModelTest(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )

        # Create a test question
        self.question = Question.objects.create(
            title='Sample Question',
            language='Python',
            details='How to test models in Django?',
            code_snippet='print("Test")',
            author=self.user
        )

        # Create a test comment
        self.comment = Comment.objects.create(
            details='This is a test comment',
            code_snippet='print("Test comment")',
            language_id=71,
            question=self.question,
            author=self.user
        )

    def test_comment_creation(self):
        # Test if comment is created successfully
        self.assertEqual(self.comment.details, 'This is a test comment')
        self.assertEqual(self.comment.language_id, 71)
        self.assertEqual(self.comment.question.title, 'Sample Question')
        self.assertEqual(self.comment.author.username, 'testuser')

    def test_run_snippet(self):
        # Test if the `run_snippet` method returns correct output
        result = self.comment.run_snippet()
        self.assertIn('Test comment', result)  # Ensure the output matches the snippet's print statement

class QuestionModelTest(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )

        # Create a test question
        self.question = Question.objects.create(
            title='Sample Question',
            language='Python',
            language_id=71,  # Language ID for Python
            details='How to test models in Django?',
            code_snippet='print("Test")',
            tags=['Django', 'Testing'],
            topic='Django Testing',
            author=self.user
        )

    def test_question_creation(self):
        # Test if question is created successfully
        self.assertEqual(self.question.title, 'Sample Question')
        self.assertEqual(self.question.language, 'Python')
        self.assertEqual(self.question.language_id, 71)
        self.assertEqual(self.question.details, 'How to test models in Django?')
        self.assertEqual(self.question.code_snippet, 'print("Test")')
        self.assertEqual(self.question.tags, ['Django', 'Testing'])
        self.assertEqual(self.question.topic, 'Django Testing')
        self.assertEqual(self.question.author.username, 'testuser')

    def test_question_snippet_execution(self):
        # Test if the `run_snippet` method works
        result = self.question.run_snippet()
        self.assertIn('Test', result)  # Ensure the output matches the snippet's print statement

    def test_mark_as_answered(self):
        # Test if the `mark_as_answered` method works
        self.question.mark_as_answered()
        self.question.refresh_from_db()  # Refresh the instance
        self.assertTrue(self.question.answered)

    def test_question_upvotes(self):
        # Test the upvotes field
        self.assertEqual(self.question.upvotes, 0)  # Initially, upvotes should be 0
        self.question.upvotes += 1
        self.question.save()
        self.assertEqual(self.question.upvotes, 1)  # After incrementing, upvotes should be 1

    def test_reported_by_relationship(self):
        # Test the ManyToMany relationship with `reported_by`
        self.assertEqual(self.question.reported_by.count(), 0)  # Initially, no reports
        self.question.reported_by.add(self.user)
        self.question.save()
        self.assertEqual(self.question.reported_by.count(), 1)  # After adding, it should be 1
        self.assertEqual(self.question.reported_by.first().username, 'testuser')  # Ensure the user is added

    def test_question_str_method(self):
        # Test the string representation of the question
        question_str = str(self.question)
        self.assertIn(self.question.title, question_str)  # The title should be in the string representation

    def test_question_created_at(self):
        # Test if the `created_at` field is automatically set
        self.assertTrue(self.question.created_at)
        self.assertTrue(isinstance(self.question.created_at, timezone.datetime))

    def test_question_topic(self):
        # Test if the `topic` field is correctly saved
        self.assertEqual(self.question.topic, 'Django Testing')

    def test_question_tags(self):
        # Test if the `tags` field is correctly saved
        self.assertEqual(self.question.tags, ['Django', 'Testing'])



class VoteModelTest(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )

        # Create a test question
        self.question = Question.objects.create(
            title='Sample Question',
            language='Python',
            details='How to test models in Django?',
            code_snippet='print("Test")',
            author=self.user
        )

        # Create a test comment
        self.comment = Comment.objects.create(
            details='This is a test comment',
            code_snippet='print("Test comment")',
            language_id=71,
            question=self.question,
            author=self.user
        )

        # Create a test vote
        self.vote = Question_Vote.objects.create(
            vote_type=VoteType.UPVOTE.value,
            user=self.user,
            question=self.question
        )

    def test_question_vote_creation(self):
        # Test if the vote is created correctly
        self.assertEqual(self.vote.vote_type, 'upvote')
        self.assertEqual(self.vote.user.username, 'testuser')
        self.assertEqual(self.vote.question.title, 'Sample Question')

    def test_comment_vote_creation(self):
        # Test if the comment vote is created correctly
        comment_vote = Comment_Vote.objects.create(
            vote_type=VoteType.DOWNVOTE.value,
            user=self.user,
            comment=self.comment
        )
        self.assertEqual(comment_vote.vote_type, 'downvote')
        self.assertEqual(comment_vote.user.username, 'testuser')
        self.assertEqual(comment_vote.comment.details, 'This is a test comment')

    def test_vote_str_method(self):
        # Test the string representation of the vote
        vote_str = str(self.vote)
        self.assertIn(self.user.username, vote_str)
        self.assertIn(self.vote.vote_type, vote_str)
        self.assertIn(self.question.title, vote_str)
