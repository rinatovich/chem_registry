import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from users.models import CompanyProfile

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

# ПЕРЕИМЕНОВАЛИ supplier_user -> supplier
@pytest.fixture
def supplier(db):
    """Создает пользователя-поставщика с профилем компании"""
    user = User.objects.create_user(
        username='supplier',
        email='supplier@test.uz',
        password='password123',
        role='SUPPLIER'
    )
    CompanyProfile.objects.create(
        user=user,
        company_name='Test Factory LLC',
        inn='123456789',
        is_manufacturer=True
    )
    return user

@pytest.fixture
def auth_client(api_client, supplier):
    """Клиент, уже авторизованный как поставщик"""
    api_client.force_authenticate(user=supplier)
    return api_client

@pytest.fixture
def admin_user(db):
    return User.objects.create_user(username='admin', password='password', is_staff=True, is_superuser=True)