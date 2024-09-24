import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "wikidata_django_practice.settings")
django.setup()

import unittest
from unittest.mock import patch
from django.test import RequestFactory
from django.http import JsonResponse
from django.urls import reverse
from views import route_list, create_user, like_route
from models import Route, User
import json
import os
from django.conf import settings
import django

class TestRouteListView(unittest.TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create(username='testuser', email='testuser@example.com', password='securepassword')
        self.route = Route.objects.create(
            route_id=1,
            title='Test Route',
            description='Test Description',
            photos=[],
            rating=4.5,
            likes=10,
            comments=[],
            saves=5,
            node_ids='1,2,3',
            node_names='Node1,Node2,Node3',
            duration='30',
            duration_between='5',
            mapView='test_mapview',
            user=self.user.user_id
        )

    def test_route_list_view(self):
        request = self.factory.get(reverse('route_list'))
        response = route_list(request)
        self.assertIsInstance(response, JsonResponse)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], 'Test Route')


class TestCreateUserView(unittest.TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_create_user_view(self):
        request_data = {
            "username": "new_user",
            "email": "new_user@example.com",
            "password": "securE12password"
        }
        request = self.factory.post(reverse('create_user'), json.dumps(request_data), content_type='application/json')
        response = create_user(request)
        self.assertIsInstance(response, JsonResponse)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['username'], 'new_user')
        self.assertEqual(data['e_mail'], 'new_user@example.com')


class TestLikeRouteView(unittest.TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create(username='testuser', email='testuser@example.com', password='securepassword')
        self.route = Route.objects.create(
            route_id=1,
            title='Test Route',
            description='Test Description',
            photos=[],
            rating=4.5,
            likes=10,
            comments=[],
            saves=5,
            node_ids='1,2,3',
            node_names='Node1,Node2,Node3',
            duration='30',
            duration_between='5',
            mapView='test_mapview',
            user=self.user.user_id
        )

    def test_like_route_view(self):
        request_data = {
            "user_id": self.user.user_id,
            "route_id": self.route.route_id
        }
        request = self.factory.post(reverse('like_route'), json.dumps(request_data), content_type='application/json')
        response = like_route(request)
        self.assertIsInstance(response, JsonResponse)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertTrue(data['liked'])
        self.assertEqual(data['likes'], 11)

if __name__ == '__main__':
    unittest.main()
