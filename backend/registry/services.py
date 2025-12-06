import pandas as pd
from openpyxl import Workbook
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from django.db import transaction
from constance import config

# Импорт моделей
from registry.models import (
    ChemicalElement, RegistryConfig,
    Sec1Identification, Sec2Physical, Sec3ToxSanPin, Sec4ToxAir,
    Sec5ToxAcute, Sec6ToxRisks, Sec8EcoTox, Sec9Soil, Sec10Water,
    Sec11HazardClass, Sec12GHSClass, Sec13GHSLabel,
    Sec14Safety, Sec15Storage, Sec16Waste, Sec17Incidents,
    Sec18InternationalReg, Sec20Docs, Sec21Companies,
    Sec22Volumes, Sec23Extra
)

from .structures import SECTION_MAP

def get_field_info(model, field_name):
    try:
        return model._meta.get_field(field_name)
    except:
        return None

# =========================================================================
# 1. ГЕНЕРАЦИЯ ШАБЛОНА (Без изменений)
# =========================================================================
def generate_excel_template():
    wb = Workbook()
    ws = wb.active
    ws.title = "Форма реестра"
    ws.freeze_panes = "A2"

    config_obj = RegistryConfig.objects.first()
    required_in_db = config_obj.required_fields if config_obj else []
    visible_in_db = config_obj.template_fields if config_obj else []

    header_font = Font(bold=True, color="FFFFFF", size=10)
    center_align = Alignment(horizontal='center', vertical='center', wrap_text=True)
    border = Border(left=Side(style='thin'), right=Side(style='thin'))

    current_col = 1

    for section_name, hex_color, model_cls, fields in SECTION_MAP:
        section_has_visible_fields = False
        for _, db_f, is_sys in fields:
            if is_sys or (not visible_in_db) or (db_f in visible_in_db):
                section_has_visible_fields = True
                break

        if not section_has_visible_fields:
            continue

        fill = PatternFill(start_color=hex_color, end_color=hex_color, fill_type="solid")

        for excel_header, db_field, is_system_required in fields:
            if not is_system_required and visible_in_db and (db_field not in visible_in_db):
                continue

            is_mandatory = is_system_required or (db_field in required_in_db)
            final_header = excel_header + (" *" if is_mandatory else "")

            cell = ws.cell(row=1, column=current_col, value=final_header)
            cell.font = header_font
            cell.fill = fill
            cell.alignment = center_align
            cell.border = border

            col_letter = get_column_letter(current_col)
            ws.column_dimensions[col_letter].width = 25

            field_obj = get_field_info(model_cls, db_field)
            if field_obj and field_obj.choices:
                options = [str(c[1]).strip() for c in field_obj.choices]
                formula_str = ",".join(options).replace("\"", "").replace("'", "")

                if len(formula_str) < 255:
                    dv = DataValidation(type="list", formula1=f'"{formula_str}"', allow_blank=True)
                    ws.add_data_validation(dv)
                    dv.add(f"{col_letter}2:{col_letter}2000")

            current_col += 1

    return wb

# =========================================================================
# 2. ИМПОРТ (С ЧЕЛОВЕЧЕСКИМИ ОШИБКАМИ)
# =========================================================================
def parse_boolean(value):
    v = str(value).lower().strip()
    return v in ['+', '1', 'yes', 'да', 'true', 'есть', 'y']

def process_excel_import(file, user):
    try:
        df = pd.read_excel(file)
        # Очистка заголовков от *
        clean_cols = []
        for col in df.columns:
            c = str(col).strip()
            if c.endswith(" *"): c = c[:-2]
            elif c.endswith("*"): c = c[:-1]
            clean_cols.append(c)
        df.columns = clean_cols

        df = df.fillna("")
    except Exception as e:
        return {"success": 0, "errors": [f"Ошибка чтения файла: {str(e)}"]}

    report = {"success": 0, "errors": []}

    # 1. Создаем карты маппинга
    FLAT_MAP = {}      # Excel Заголовок -> (Модель, Поле)
    HUMAN_NAMES = {}   # Код поля (appearance) -> Человеческое имя (Агрегатное состояние)

    for _, _, model, fields in SECTION_MAP:
        for ex_head, db_field, _ in fields:
            FLAT_MAP[ex_head] = (model, db_field)
            HUMAN_NAMES[db_field] = ex_head # Сохраняем перевод кода

    # 2. Итерация
    for index, row in df.iterrows():
        row_num = index + 2
        try:
            with transaction.atomic():
                extracted_data = {}
                element = None

                # A. Парсинг
                for col_name in df.columns:
                    col_name_clean = col_name.strip()
                    if col_name_clean not in FLAT_MAP: continue

                    target_model, target_field = FLAT_MAP[col_name_clean]
                    raw_value = str(row[col_name]).strip()

                    if not raw_value: continue

                    field_obj = get_field_info(target_model, target_field)
                    final_value = raw_value

                    if field_obj and field_obj.choices:
                        for k, label in field_obj.choices:
                            if raw_value.lower() == str(label).lower() or raw_value.lower() == str(k).lower():
                                final_value = k
                                break

                    if field_obj and field_obj.get_internal_type() == 'BooleanField':
                        final_value = parse_boolean(raw_value)

                    if target_model not in extracted_data: extracted_data[target_model] = {}
                    extracted_data[target_model][target_field] = final_value

                # Б. ВАЛИДАЦИЯ (Улучшенная)
                config_obj = RegistryConfig.objects.first()
                required_list = config_obj.required_fields if config_obj else []

                if required_list:
                    for field_name in required_list:
                        found = False
                        for model_class, fields_dict in extracted_data.items():
                            if field_name in fields_dict:
                                val = fields_dict[field_name]
                                if val is not None and val != "":
                                    found = True
                                    break

                        if not found:
                            # --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
                            # Ищем понятное имя. Если не нашли, используем код
                            human_name = HUMAN_NAMES.get(field_name, field_name)
                            raise ValueError(f"Поле '{human_name}' является обязательным. Пожалуйста, заполните его.")

                # В. Системная валидация
                if ChemicalElement not in extracted_data or 'primary_name_ru' not in extracted_data[ChemicalElement]:
                     if not row.empty and any(str(x).strip() for x in row):
                        raise ValueError("Отсутствует 'Название вещества (RU)'")
                     continue

                # Г. Сохранение
                element = ChemicalElement.objects.create(
                    created_by=user,
                    status=ChemicalElement.Status.DRAFT,
                    **extracted_data[ChemicalElement]
                )

                for model_cls, fields_dict in extracted_data.items():
                    if model_cls == ChemicalElement: continue
                    model_cls.objects.create(element=element, **fields_dict)

                for rel_obj in ChemicalElement._meta.related_objects:
                    if rel_obj.one_to_one:
                        if not hasattr(element, rel_obj.name):
                            rel_obj.related_model.objects.create(element=element)

                report["success"] += 1

        except Exception as e:
            report["errors"].append(f"Строка {row_num}: {str(e)}")

    return report