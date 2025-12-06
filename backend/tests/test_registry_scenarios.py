import pytest
import io
import pandas as pd
from django.core.files.uploadedfile import SimpleUploadedFile
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
        admin_user = User.objects.create_user('admin', 'admin')
        other_draft = ChemicalElement.objects.create(
            created_by=admin_user,
            status='DRAFT',
            primary_name_ru="Чужой черновик"
        )

        # 1. Поставщик видит свое?
        response = auth_client.get('/api/registry/elements/')
        assert response.status_code == 200
        data = response.json()

        # Пагинация
        if isinstance(data, dict) and 'results' in data:
            items = data['results']
        else:
            items = data

        assert any(item['id'] == my_draft.id for item in items)
        # Не видит чужое
        assert not any(item['id'] == other_draft.id for item in items)

        # ========================================================
        # ФИКС: Сбрасываем авторизацию, чтобы стать Гостем!
        # ========================================================
        api_client.force_authenticate(user=None)

        # 3. Гость (аноним) не видит черновики
        response = api_client.get('/api/registry/elements/')
        data_guest = response.json()

        if isinstance(data_guest, dict) and 'results' in data_guest:
            items_guest = data_guest['results']
        else:
            items_guest = data_guest

        assert len(items_guest) == 0

    # 2. ТЕСТ: Полный цикл Импорта Excel
    def test_excel_import_full_cycle(self, auth_client, supplier):
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

        response = auth_client.post(
            '/api/registry/import/upload/',
            {'file': file},
            format='multipart'
        )
        assert response.status_code == 202

        # Проверяем Базу
        assert ChemicalElement.objects.count() == 1
        elem = ChemicalElement.objects.first()

        assert elem.primary_name_ru == 'Автоматический Тест'
        assert elem.sec2_physical.appearance == 'LIQUID'

    # 3. ТЕСТ: Валидация (Config)
    def test_validation_config(self, auth_client):
        # 1. Настройка
        conf = RegistryConfig.objects.create()
        conf.required_fields = ['cas_number']
        conf.save()

        # 2. Плохой файл
        df = pd.DataFrame([{'Название вещества (RU)': 'Без Каса'}])
        output = io.BytesIO()
        df.to_excel(output, index=False)
        output.seek(0)
        file = SimpleUploadedFile("bad.xlsx", output.read(), content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

        # 3. Загружаем
        response = auth_client.post('/api/registry/import/upload/', {'file': file}, format='multipart')

        # 4. Проверяем ответ задачи
        # В режиме теста (eager) Celery может вернуть не совсем стандартный JSON для APIView
        # Но наш View отдает {"task_id": "...", ...}
        task_id = response.data.get('task_id')

        # Проверяем статус
        status_res = auth_client.get(f'/api/registry/tasks/{task_id}/')
        res_data = status_res.json()

        # Должен быть статус DONE/SUCCESS, но внутри ошибка валидации
        # Наш таск возвращает структуру { "status": "DONE", "result": { ... "errors": [] } }
        assert res_data['status'] in ['SUCCESS', 'DONE']

        # Извлекаем вложенный result
        inner_result = res_data.get('result', {})
        if isinstance(inner_result, dict) and 'result' in inner_result:
             # Двойная вложенность Celery Eager backend
             inner_result = inner_result['result']

        # Проверка ошибок
        assert inner_result['imported'] == 0
        assert "cas_number" in str(inner_result.get('errors', []))