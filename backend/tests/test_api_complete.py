import pytest
from unittest.mock import patch
from django.contrib.auth import get_user_model
from registry.models import ChemicalElement, Sec2Physical

User = get_user_model()

@pytest.mark.django_db
class TestAuthAPI:
    def test_registration(self, api_client):
        payload = {
            "username": "new_corp",
            "password": "StrongPassword123!",
            "email": "corp@test.uz",
            "company": {
                "company_name": "New Corp LLC",
                "inn": "998877665",
                "is_manufacturer": True
            }
        }
        response = api_client.post('/api/auth/register/', payload, format='json')
        assert response.status_code == 201
        assert User.objects.count() == 1
        assert User.objects.first().role == 'SUPPLIER'

    def test_login_and_me(self, api_client, supplier):
        # === ИСПРАВЛЕНИЕ: Используем данные из фикстуры supplier ===
        response = api_client.post('/api/token/', {
            "username": "supplier", "password": "password123"
        })
        # ===========================================================
        assert response.status_code == 200
        token = response.data['access']

        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = api_client.get('/api/auth/me/')
        assert response.status_code == 200
        assert response.data['company']['company_name'] == 'Test Factory LLC'


@pytest.mark.django_db
class TestRegistryCRUD:
    def test_create_element_manual(self, auth_client, supplier):
        payload = {
            "primary_name_ru": "Ручное Вещество",
            "cas_number": "111-22-33",
            "sec1_identification": {"synonyms": "Тест синоним"},
            "sec2_physical": {"ph": "7"}
        }
        response = auth_client.post('/api/registry/elements/', payload, format='json')
        assert response.status_code == 201

        elem = ChemicalElement.objects.get(cas_number="111-22-33")
        assert elem.created_by == supplier
        assert elem.status == "DRAFT"
        assert elem.sec2_physical.ph == "7"

    def test_update_element(self, auth_client, supplier):
        elem = ChemicalElement.objects.create(created_by=supplier, primary_name_ru="Old Name")
        payload = {"primary_name_ru": "New Name"}
        response = auth_client.patch(f'/api/registry/elements/{elem.id}/', payload)
        assert response.status_code == 200
        elem.refresh_from_db()
        assert elem.primary_name_ru == "New Name"

    def test_delete_permission(self, api_client, supplier):
        other_user = User.objects.create_user('hacker', 'pass')
        api_client.force_authenticate(user=other_user)
        elem = ChemicalElement.objects.create(created_by=supplier, primary_name_ru="My Tech")
        response = api_client.delete(f'/api/registry/elements/{elem.id}/')
        assert response.status_code in [403, 404]


@pytest.mark.django_db
class TestAdminActions:
    @patch('registry.tasks.send_status_email_task.delay')
    def test_admin_set_status(self, mock_task, api_client, supplier):
        admin = User.objects.create_user('admin', 'pass', is_staff=True)
        api_client.force_authenticate(user=admin)

        elem = ChemicalElement.objects.create(created_by=supplier, status='DRAFT', primary_name_ru="Test Element")

        response = api_client.patch(f'/api/registry/elements/{elem.id}/', {"status": "PUBLISHED"})

        assert response.status_code == 200
        elem.refresh_from_db()
        assert elem.status == 'PUBLISHED'

    @pytest.mark.skip(reason="Пропускаем, если нет триграмм в тест БД")
    def test_smart_search(self, auth_client, supplier):
        ChemicalElement.objects.create(created_by=supplier, status='PUBLISHED', primary_name_ru="Аммиак водный")
        response = auth_client.get('/api/registry/elements/', {'search': 'Амиак'})
        assert response.status_code == 200

    def test_pdf_generation(self, api_client, supplier):
        elem = ChemicalElement.objects.create(created_by=supplier, status='PUBLISHED', primary_name_ru="PDF Test")
        Sec2Physical.objects.create(element=elem)
        response = api_client.get(f'/api/registry/elements/{elem.id}/pdf/')
        assert response.status_code == 200
        assert response['Content-Type'] == 'application/pdf'

    def test_statistics(self, api_client, supplier):
        ChemicalElement.objects.create(created_by=supplier, status='PUBLISHED')
        ChemicalElement.objects.create(created_by=supplier, status='DRAFT')
        response = api_client.get('/api/registry/stats/')
        assert response.status_code == 200
        assert response.data['total_elements'] == 1