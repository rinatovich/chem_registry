from registry.models import (
    ChemicalElement, Sec1Identification, Sec2Physical, Sec3ToxSanPin,
    Sec4ToxAir, Sec5ToxAcute, Sec6ToxRisks, Sec8EcoTox, Sec9Soil, Sec10Water,
    Sec11HazardClass, Sec12GHSClass, Sec13GHSLabel, Sec14Safety, Sec15Storage,
    Sec16Waste, Sec17Incidents, Sec18InternationalReg, Sec20Docs, Sec21Companies,
    Sec22Volumes, Sec23Extra
)

# Важно: Сюда мы перенесли SECTION_MAP целиком из services.py
SECTION_MAP = [
    ("ГЛАВНАЯ ИНФОРМАЦИЯ", "34495E", ChemicalElement, [
        ("Название вещества (RU)", "primary_name_ru", True),
        ("CAS номер",              "cas_number",      False),
    ]),
    ("I. ИДЕНТИФИКАЦИЯ", "2980B9", Sec1Identification, [
        ("Синонимы",               "synonyms",          False),
        ("Молекулярная формула",   "molecular_formula", False),
        ("Структурная формула",    "structural_formula",False),
        ("Номер ЕС",               "ec_number",         False),
        ("IUPAC (RU)",             "iupac_name_ru",     False),
        ("Код ТН ВЭД",             "tnved_code",        False),
    ]),
    ("II. ФИЗИКО-ХИМИЧЕСКИЕ СВОЙСТВА", "16A085", Sec2Physical, [
        ("Агрегатное состояние",   "appearance",       False), # Выбор из списка
        ("Запах",                  "odor",             False), # Выбор из списка
        ("Цвет",                   "color",            False),
        ("pH",                     "ph",               False),
        ("Молекулярная масса",     "mol_mass",         False),
        ("Т. плавления (°C)",      "melting_point",    False),
        ("Т. кипения (°C)",        "boiling_point",    False),
        ("Плотность (г/см3)",      "density",          False),
        ("Растворимость в воде",   "solubility_water", False),
    ]),
    ("III. ТОКСИКОЛОГИЯ (СанПиН)", "C0392B", Sec3ToxSanPin, [
        ("ПДК раб.зоны (мг/м3)",   "pdk_workzone",     False),
        ("Состояние в воздухе",    "state_in_air",     False), # Выбор из списка
        ("LD50 желудок",           "ld50_stomach",     False),
        ("LC50 воздух",            "lc50_air",         False),
        ("Зона острого действия",  "zone_acute",       False),
        ("КВИО",                   "kvio",             False),
    ]),
    ("IV. ТОКСИКОЛОГИЯ (АТМОСФЕРА)", "D35400", Sec4ToxAir, [
        ("Лимитирующий признак",   "limit_sign",       False), # Выбор из списка
        ("Макс. разовая ПДК",      "pdk_max_single",   False),
        ("Среднесуточная ПДК",     "pdk_daily_avg",    False),
    ]),
    ("V. ОСТРАЯ ТОКСИЧНОСТЬ", "E67E22", Sec5ToxAcute, [
        ("Ингаляционный эффект",   "inhalation_lc50_effect", False),
        ("Значение LC50 (ингал)",  "inhalation_lc50_val",    False),
        ("Дермальный эффект",      "dermal_ld50_effect",     False),
        ("Пероральный эффект",     "oral_ld50_effect",       False),
    ]),
    ("VI. РИСКИ (СГС)", "8E44AD", Sec6ToxRisks, [
        ("Разъедание кожи (Кат)",       "skin_corr",        False),
        ("Повреждение глаз (Кат)",      "eye_dmg",          False),
        ("Сенсибилизация (Кат)",        "sensitization",    False),
        ("Канцерогенность (Кат)",       "carcinogenicity",  False),
        ("Репродуктивная токс. (Кат)",  "repro_tox",        False),
    ]),
    ("VIII. ЭКОЛОГИЯ", "27AE60", Sec8EcoTox, [
        ("LD50 Рыбы",              "ld50_fish",        False),
        ("LD50 Птицы",             "ld50_birds",       False),
        ("Биоаккумуляция (+/-)",   "bioaccumulation",  False), # Boolean
        ("Фитотоксичность (+/-)",  "phytotoxicity",    False), # Boolean
    ]),
    ("IX. ПОЧВА", "2ECC71", Sec9Soil, [
        ("ПДК в почве",            "pdk_soil",         False),
        ("Персистентность",        "persistence",      False),
        ("Миграция",               "migration",        False),
    ]),
    ("XI. КЛАССЫ ОПАСНОСТИ", "7F8C8D", Sec11HazardClass, [
        ("Класс (СанПиН 0294-11)", "sanpin_class",     False),
        ("Класс (ГОСТ 12.1.007)",  "gost_body_class",  False),
        ("Класс (ГОСТ 32424)",     "gost_env_class",   False),
    ]),
    ("XII. СГС ИНФОРМАЦИЯ (Текст)", "9B59B6", Sec12GHSClass, [
        ("Физ. опасности (текст)", "phys_hazard", False),
    ]),
    ("XIII. МАРКИРОВКА СГС", "9B59B6", Sec13GHSLabel, [
        ("Сигнальное слово",       "signal_word",      False),
        ("Коды пиктограмм",        "pictogram_code",   False),
        ("H-фразы",                "h_phrases",        False),
        ("P-фразы",                "p_phrases",        False),
    ]),
    ("XV. ХРАНЕНИЕ", "3498DB", Sec15Storage, [
        ("Требования к хранению",  "storage_reqs",     False),
        ("Несовместимые в-ва",     "incompatible",     False),
    ]),
    ("XVI. ОТХОДЫ", "95A5A6", Sec16Waste, [
        ("Утилизация",             "disposal",         False),
    ]),
    ("XVII. ИНЦИДЕНТЫ", "E74C3C", Sec17Incidents, [
        ("История аварий",         "accident_history", False), # Обновленное поле
    ]),
    ("XVIII. РЕГУЛИРОВАНИЕ (+/-)", "34495E", Sec18InternationalReg, [
        ("Озоноразрушающее",       "ozone_destroying", False),
        ("Стокгольм (СОЗ)",        "pops",             False),
        ("Роттердам (PIC)",        "pic",              False),
        ("Минамата (Ртуть)",       "mercury",          False),
    ]),
    ("XX. ДОКУМЕНТЫ", "2C3E50", Sec20Docs, [
        ("ГОСТы и НПА",            "gost_standards",   False),
    ]),
    ("XXI. КОМПАНИИ", "2C3E50", Sec21Companies, [
        ("Участники (Инфо)",       "info",             False),
    ]),
]