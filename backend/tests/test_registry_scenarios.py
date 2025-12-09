import pytest
import io
import pandas as pd
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from registry.models import ChemicalElement, RegistryConfig, Sec2Physical
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
class TestRegistryWorkFlow:

    # 1. ТЕСТ: Доступность (Приватность)
    def test_visibility_b2b(self, api_client, auth_client, supplier):
        # Поставщик создает черновик
        my_draft = ChemicalElement.objects.create(
            created_by=supplier,
            status='DRAFT',
            primary_name_ru="Мой черновик"
        )

        # Чужой черновик
        admin_user = User.objects.create_user('admin_test', 'admin')
        other_draft = ChemicalElement.objects.create(
            created_by=admin_user,
            status='DRAFT',
            primary_name_ru="Чужой черновик"
        )

        # 1. Поставщик видит свое?
        response = auth_client.get('/api/registry/elements/')
        assert response.status_code == 200
        data = response.json()

        # Обработка пагинации
        items = data['results'] if 'results' in data else data

        assert any(item['id'] == my_draft.id for item in items)
        # Не видит чужое
        assert not any(item['id'] == other_draft.id for item in items)

        # 2. Гость (аноним) не видит черновики
        api_client.force_authenticate(user=None)
        response = api_client.get('/api/registry/elements/')
        data_guest = response.json()
        items_guest = data_guest['results'] if 'results' in data_guest else data_guest

        # В БД есть черновики, но аноним их не видит (видит только PUBLISHED, которых нет)
        assert len(items_guest) == 0

    # 2. ТЕСТ: Полный цикл Импорта Excel
    # Важно: включаем режим "EAGER", чтобы Celery выполнил задачу мгновенно, без воркера
    @override_settings(CELERY_TASK_ALWAYS_EAGER=True)
    def test_excel_import_full_cycle(self, auth_client, supplier):
        # Генерируем Excel
        df = pd.DataFrame([{
            'Название вещества (RU)': 'Автоматический Тест',
            'CAS номер': '777-88-9',
            'Агрегатное состояние': 'Жидкость'
        }])

        output = io.BytesIO()
        df.to_excel(output, index=False)
        output.seek(0)

        file = SimpleUploadedFile(
            "test_import.xlsx",
            output.read(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

        # Отправляем на эндпоинт
        response = auth_client.post(
            '/api/registry/import/upload/',
            {'file': file},
            format='multipart'
        )
        assert response.status_code == 202
        task_id = response.data['task_id']
        assert task_id

        # Так как стоит ALWAYS_EAGER=True, задача уже выполнилась.
        # Проверяем результат в БД
        assert ChemicalElement.objects.count() == 1
        elem = ChemicalElement.objects.first()

        assert elem.primary_name_ru == 'Автоматический Тест'
        assert elem.sec2_physical.appearance == 'LIQUID'

    # 3. ТЕСТ: Валидация (Config)
    @override_settings(CELERY_TASK_ALWAYS_EAGER=True)
    def test_validation_config(self, auth_client):
        # 1. Настройка: CAS обязателен
        RegistryConfig.objects.create(required_fields=['cas_number'])

        # 2. Плохой файл (Нет CAS)
        df = pd.DataFrame([{'Название вещества (RU)': 'Без Каса'}])
        output = io.BytesIO()
        df.to_excel(output, index=False)
        output.seek(0)
        file = SimpleUploadedFile("bad.xlsx", output.read(), content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

        # 3. Загружаем
        response = auth_client.post('/api/registry/import/upload/', {'file': file}, format='multipart')
        task_id = response.data.get('task_id')

        # 4. Проверяем статус задачи через API
        status_res = auth_client.get(f'/api/registry/tasks/{task_id}/')
        res_data = status_res.json()

        # EAGER режим возвращает SUCCESS/DONE сразу
        assert res_data['status'] in ['SUCCESS', 'DONE']

        result = res_data.get('result', {})

        # Проверка: импортировано 0, есть ошибки
        assert result['imported'] == 0
        assert len(result['errors']) > 0
        # Проверяем наличие текста об ошибке
        errors_str = str(result['errors'])
        assert "CAS номер" in errors_str or "cas_number" in errors_str