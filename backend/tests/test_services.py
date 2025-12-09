import pytest
import pandas as pd
import io
from registry.models import ChemicalElement, Sec2Physical, RegistryConfig
from registry.services import process_excel_import

@pytest.mark.django_db
class TestExcelImportService:

    def test_import_clean_headers(self, supplier):
        """
        Тест проверяет:
        1. Создание элемента из Excel.
        2. Нормализацию заголовков (убирает лишние пробелы и *).
        3. Заполнение вложенных моделей (Sec2Physical).
        """
        # Создаем DataFrame (симуляция Excel)
        data = {
            'Название вещества (RU) *': ['Тестовый Ацетон'],
            'CAS номер': ['67-64-1'],
            'Агрегатное состояние ': ['Жидкость'], # Лишний пробел
            '  Цвет': ['Бесцветный']              # Лишние пробелы в начале
        }
        df = pd.DataFrame(data)

        # Конвертируем в байты
        output = io.BytesIO()
        df.to_excel(output, index=False)
        output.seek(0)

        # Запускаем сервис (используем фикстуру supplier)
        report = process_excel_import(output, supplier)

        # Проверки
        assert report['success'] == 1
        assert len(report['errors']) == 0

        # Проверяем БД
        elem = ChemicalElement.objects.get(cas_number='67-64-1')
        assert elem.primary_name_ru == 'Тестовый Ацетон'

        # ИСПРАВЛЕНО: supplier_user -> supplier
        assert elem.created_by == supplier

        # Проверяем связанную модель
        assert elem.sec2_physical.appearance == 'LIQUID'
        assert elem.sec2_physical.color == 'Бесцветный'

    # ИСПРАВЛЕНО: аргумент supplier_user -> supplier
    def test_import_validation_error(self, supplier):
        """Проверка обязательных полей через Config"""
        RegistryConfig.objects.create(required_fields=['cas_number'])

        # Файл без CAS
        data = {
            'Название вещества (RU)': ['Плохое вещество'],
        }
        df = pd.DataFrame(data)
        output = io.BytesIO()
        df.to_excel(output, index=False)
        output.seek(0)

        report = process_excel_import(output, supplier)

        # Должна быть ошибка
        assert report['success'] == 0
        assert len(report['errors']) == 1
        assert "CAS номер" in report['errors'][0]