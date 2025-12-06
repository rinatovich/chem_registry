import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from users.models import CompanyProfile

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

# Создаем поставщика и сразу его логиним
@pytest.fixture
def supplier(db):
    user = User.objects.create_user(username='producer', password='password')
    CompanyProfile.objects.create(
        user=user,
        company_name='Test Factory LLC',
        is_manufacturer=True
    )
    return user

@pytest.fixture
def auth_client(api_client, supplier):
    api_client.force_authenticate(user=supplier)
    return api_client