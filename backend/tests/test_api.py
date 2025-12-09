import pytest
from registry.models import ChemicalElement, Sec2Physical

@pytest.mark.django_db
class TestRegistryAPI:

    def test_n_plus_one_problem(self, auth_client, django_assert_num_queries):
        for i in range(10):
            elem = ChemicalElement.objects.create(
                primary_name_ru=f"Elem {i}",
                created_by=auth_client.handler._force_user,
                status='PUBLISHED'
            )
            Sec2Physical.objects.create(element=elem, color="Red")

        with django_assert_num_queries(2):
            res = auth_client.get('/api/registry/elements/')
            assert res.status_code == 200
            assert len(res.data['results']) == 10

    def test_create_full_structure(self, auth_client):
        payload = {
            "primary_name_ru": "Complex Element",
            "cas_number": "111-22-33",
            "sec2_physical": {"color": "Green", "ph": "7.5"},
            "sec14_safety": {"first_aid": "Call doctor"}
        }
        res = auth_client.post('/api/registry/elements/', payload, format='json')
        assert res.status_code == 201

        elem_id = res.data['id']
        elem = ChemicalElement.objects.get(id=elem_id)
        assert elem.sec2_physical.color == "Green"
        assert hasattr(elem, 'sec17_incidents')

    # === ИСПРАВЛЕНИЕ: supplier_user -> supplier ===
    def test_permissions_isolation(self, api_client, supplier):
        ChemicalElement.objects.create(
            primary_name_ru="Secret Draft",
            created_by=supplier,
            status='DRAFT'
        )

        res = api_client.get('/api/registry/elements/')
        assert res.data['count'] == 0

        api_client.force_authenticate(user=supplier)
        res = api_client.get('/api/registry/elements/')
        assert res.data['count'] == 1