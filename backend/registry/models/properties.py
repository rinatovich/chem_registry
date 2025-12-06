from simple_history.models import HistoricalRecords
from django.db import models
from .core import *
from .common import *
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from .common import ConfigValidationMixin


class Sec3ToxSanPin(ConfigValidationMixin, models.Model):
    class StateAir(models.TextChoices):
        VAPOR = 'P', 'Пары (п)'
        AEROSOL = 'A', 'Аэрозоль (а)'
        MIX = 'PA', 'Смесь (п+а)'

    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec3_sanpin')

    state_in_air = models.CharField(max_length=10, choices=StateAir.choices, blank=True, verbose_name="Состояние в воздухе раб. зоны")

    pdk_workzone = models.CharField(max_length=100, blank=True, verbose_name="ПДК раб. зоны (мг/м3)")
    ld50_stomach = models.CharField(max_length=100, blank=True, verbose_name="LD50 желудок")
    ld50_skin = models.CharField(max_length=100, blank=True, verbose_name="LD50 кожа")
    lc50_air = models.CharField(max_length=100, blank=True, verbose_name="LC50 воздух")
    kvio = models.CharField(max_length=100, blank=True, verbose_name="КВИО")
    zone_acute = models.CharField(max_length=100, blank=True, verbose_name="Зона острого действия")
    zone_chronic = models.CharField(max_length=100, blank=True, verbose_name="Зона хронического действия")
    history = HistoricalRecords()

    class Meta: verbose_name = "III. Токсикология (СанПиН)"

# ==========================================
# IV. Токсикология Атмосфера
# ==========================================
class Sec4ToxAir(ConfigValidationMixin, models.Model):
    class LimitingSign(models.TextChoices):
        REFLEX = 'REFLEX', 'Рефлекторное'
        RESORPTIVE = 'RESORPTIVE', 'Резорбтивное'
        REFLEX_RESORPTIVE = 'REF_RES', 'Рефлекторно-резорбтивное'
        SANITARY = 'SANITARY', 'Санитарно-бытовое'

    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec4_air')

    limit_sign = models.CharField(max_length=20, choices=LimitingSign.choices, blank=True, verbose_name="Лимитирующий признак")
    pdk_max_single = models.CharField(max_length=100, blank=True, verbose_name="Макс. разовая ПДК")
    pdk_daily_avg = models.CharField(max_length=100, blank=True, verbose_name="Среднесуточная ПДК")
    pdk_month_avg = models.CharField(max_length=100, blank=True, verbose_name="Среднемесячная ПДК")
    pdk_year_avg = models.CharField(max_length=100, blank=True, verbose_name="Среднегодовая ПДК")
    history = HistoricalRecords()

    class Meta: verbose_name = "IV. Токсикология (Атмосфера)"

# ==========================================
# V. Острая токсичность
# ==========================================
class Sec5ToxAcute(ConfigValidationMixin, models.Model):
    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec5_acute')

    inhalation_lc50_effect = models.CharField(max_length=20, choices=YesNoUnknown.choices, default=YesNoUnknown.UNKNOWN, verbose_name="Ингаляционный эффект")
    inhalation_lc50_val = models.CharField(max_length=100, blank=True, verbose_name="Значение LC50 (мг/кг)")

    dermal_ld50_effect = models.CharField(max_length=20, choices=YesNoUnknown.choices, default=YesNoUnknown.UNKNOWN, verbose_name="Дермальный эффект")
    dermal_ld50_val = models.CharField(max_length=100, blank=True, verbose_name="Значение LD50 (мг/кг)")

    oral_ld50_effect = models.CharField(max_length=20, choices=YesNoUnknown.choices, default=YesNoUnknown.UNKNOWN, verbose_name="Пероральный эффект")
    oral_ld50_val = models.CharField(max_length=100, blank=True, verbose_name="Значение LD50 (мг/кг)")
    history = HistoricalRecords()

    class Meta: verbose_name = "V. Острая токсичность"

# ==========================================
# VI. Риски СГС
# ==========================================
class Sec6ToxRisks(ConfigValidationMixin, models.Model):
    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec6_risks')

    # Меняем max_length=5 -> max_length=50 везде
    skin_corr = models.CharField(max_length=50, choices=CategoriesGHS.choices, default=CategoriesGHS.NC, verbose_name="Разъедание кожи (Категория)")
    eye_dmg = models.CharField(max_length=50, choices=CategoriesGHS.choices, default=CategoriesGHS.NC, verbose_name="Повреждение глаз (Категория)")
    sensitization = models.CharField(max_length=50, choices=CategoriesGHS.choices, default=CategoriesGHS.NC, verbose_name="Сенсибилизация (Категория)")
    mutagenicity = models.CharField(max_length=50, choices=CategoriesGHS.choices, default=CategoriesGHS.NC, verbose_name="Мутагенность (Категория)")
    carcinogenicity = models.CharField(max_length=50, choices=CategoriesGHS.choices, default=CategoriesGHS.NC, verbose_name="Канцерогенность (Категория)")
    repro_tox = models.CharField(max_length=50, choices=CategoriesGHS.choices, default=CategoriesGHS.NC, verbose_name="Репродуктивная токсичность (Кат.)")
    aspiration_hazard = models.CharField(max_length=50, choices=CategoriesGHS.choices, default=CategoriesGHS.NC, verbose_name="Аспирация (Категория)")
    history = HistoricalRecords()

    class Meta: verbose_name = "VI. Риски (СГС)"

# ==========================================
# VIII. Эко-токсикология
# ==========================================
class Sec8EcoTox(ConfigValidationMixin, models.Model):
    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec8_ecotox')

    ld50_mammals = models.CharField(max_length=100, blank=True, verbose_name="LD50 Млекопитающие")
    ld50_fish = models.CharField(max_length=100, blank=True, verbose_name="LD50 Рыбы")
    ld50_bees = models.CharField(max_length=100, blank=True, verbose_name="LD50 Пчелы")
    ld50_birds = models.CharField(max_length=100, blank=True, verbose_name="LD50 Птицы")

    bioaccumulation = models.BooleanField(default=False, verbose_name="Биоаккумуляция (Есть/Нет)")
    phytotoxicity = models.BooleanField(default=False, verbose_name="Фитотоксичность (Есть/Нет)")
    history = HistoricalRecords()

    class Meta: verbose_name = "VIII. Эко-токсикология"

# ==========================================
# IX. Почва
# ==========================================
class Sec9Soil(ConfigValidationMixin, models.Model):
    class Persistence(models.TextChoices):
        LOW = 'LOW', 'Малоустойчивые (<20 дней)'
        MEDIUM = 'MED', 'Среднеустойчивые (20-90 дней)'
        HIGH = 'HIGH', 'Устойчивые (>90 дней)'

    class Mobility(models.TextChoices):
        MOBILE = 'MOB', 'Подвижен'
        IMMOBILE = 'IMM', 'Малоподвижен'

    class Sorption(models.TextChoices):
        STRONG = 'STR', 'Сильная'
        WEAK = 'WEAK', 'Слабая'

    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec9_soil')

    pdk_soil = models.CharField(max_length=100, blank=True, verbose_name="ПДК в почве")
    odk_soil = models.CharField(max_length=100, blank=True, verbose_name="ОДК в почве")

    # Было max_length=5, меняем на 50, чтобы слово "Низкая" (6 букв) не ломало импорт
    persistence = models.CharField(max_length=50, choices=Persistence.choices, blank=True, verbose_name="Персистентность")
    sorption = models.CharField(max_length=50, choices=Sorption.choices, blank=True, verbose_name="Сорбция")
    migration = models.CharField(max_length=50, choices=Mobility.choices, blank=True, verbose_name="Миграция")
    history = HistoricalRecords()

    class Meta: verbose_name = "IX. Почва"

# ==========================================
# X. Водная среда
# ==========================================
class Sec10Water(ConfigValidationMixin, models.Model):
    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec10_water')
    acute_fish = models.CharField(max_length=100, blank=True, verbose_name="Острая (Рыбы LC50)")
    acute_algae = models.CharField(max_length=100, blank=True, verbose_name="Острая (Водоросли LC50)")
    chronic_fish = models.CharField(max_length=100, blank=True, verbose_name="Хронич. (Рыбы)")
    bioacc_logkow = models.CharField(max_length=100, blank=True, verbose_name="Potencial LogKow")
    history = HistoricalRecords()

    class Meta: verbose_name = "X. Водная среда"

# ==========================================
# XI. Классификация опасности
# ==========================================
class Sec11HazardClass(ConfigValidationMixin, models.Model):
    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec11_class')

    # ИСПОЛЬЗУЕМ ИСПРАВЛЕННЫЙ HazardClassChoices.NC
    sanpin_class = models.CharField(max_length=3, choices=HazardClassChoices.choices, default=HazardClassChoices.NC, verbose_name="Класс (СанПиН 0294-11)")
    gost_body_class = models.CharField(max_length=3, choices=HazardClassChoices.choices, default=HazardClassChoices.NC, verbose_name="Класс (ГОСТ 12.1.007)")
    gost_env_class = models.CharField(max_length=3, choices=HazardClassChoices.choices, default=HazardClassChoices.NC, verbose_name="Класс (ГОСТ 32424)")
    history = HistoricalRecords()

    class Meta: verbose_name = "XI. Классы опасности"

# ==========================================
# XII. СГС Классы
# ==========================================
class Sec12GHSClass(ConfigValidationMixin, models.Model):
    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec12_ghs')
    phys_hazard = models.TextField(blank=True, verbose_name="Физические опасности")
    chem_hazard = models.TextField(blank=True, verbose_name="Химические опасности")
    env_hazard = models.TextField(blank=True, verbose_name="Опасности для окр. среды")
    history = HistoricalRecords()

    class Meta: verbose_name = "XII. Классы СГС"

# ==========================================
# XIII. Маркировка СГС
# ==========================================
class Sec13GHSLabel(ConfigValidationMixin, models.Model):
    class SignalWord(models.TextChoices):
        DANGER = 'DANGER', 'ОПАСНО (Danger)'
        WARNING = 'WARNING', 'ОСТОРОЖНО (Warning)'
        NONE = 'NONE', 'Нет'

    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec13_label')

    signal_word = models.CharField(max_length=20, choices=SignalWord.choices, default=SignalWord.NONE, verbose_name="Сигнальное слово")
    pictogram_code = models.CharField(max_length=100, blank=True, help_text="Например: GHS01, GHS02...", verbose_name="Коды пиктограмм")
    h_phrases = models.TextField(blank=True, verbose_name="H-фразы")
    p_phrases = models.TextField(blank=True, verbose_name="P-фразы")
    history = HistoricalRecords()

    class Meta: verbose_name = "XIII. Маркировка СГС"

# ==========================================
# ОСТАЛЬНЫЕ СЕКЦИИ
# ==========================================
class Sec14Safety(ConfigValidationMixin, models.Model):
    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec14_safety')
    prevent_health = models.TextField(blank=True, verbose_name="На здоровье (СИЗ)")
    first_aid = models.TextField(blank=True, verbose_name="Первая помощь")
    prevent_env = models.TextField(blank=True, verbose_name="Меры для экологии")
    history = HistoricalRecords()
    class Meta: verbose_name = "XIV. Меры безопасности"

class Sec15Storage(ConfigValidationMixin, models.Model):
    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec15_storage')
    temp_conditions = models.CharField(max_length=100, blank=True, verbose_name="Температура")
    humidity = models.CharField(max_length=100, blank=True, verbose_name="Влажность")
    shelf_life = models.CharField(max_length=100, blank=True, verbose_name="Срок хранения")
    storage_reqs = models.TextField(blank=True, verbose_name="Требования к хранению")
    incompatible = models.TextField(blank=True, verbose_name="Несовместимые в-ва")
    history = HistoricalRecords()
    class Meta: verbose_name = "XV. Хранение"

class Sec16Waste(ConfigValidationMixin, models.Model):
    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec16_waste')
    collection = models.TextField(blank=True, verbose_name="Сбор")
    transport = models.TextField(blank=True, verbose_name="Транспортировка")
    disposal = models.TextField(blank=True, verbose_name="Утилизация")
    burial = models.TextField(blank=True, verbose_name="Захоронение")
    history = HistoricalRecords()
    class Meta: verbose_name = "XVI. Отходы"

class Sec17Incidents(ConfigValidationMixin, models.Model):
    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec17_incidents')

    accident_history = models.TextField(blank=True, verbose_name="История аварий / инцидентов")
    history = HistoricalRecords()
    class Meta: verbose_name = "XVII. Инциденты"

class Sec18InternationalReg(ConfigValidationMixin, models.Model):
    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec18_intl')
    ozone_destroying = models.BooleanField(default=False, verbose_name="Озоноразрушающее (Монреаль)")
    pops = models.BooleanField(default=False, verbose_name="СОЗ (Стокгольм)")
    pic = models.BooleanField(default=False, verbose_name="Предв. согласие (Роттердам)")
    mercury = models.BooleanField(default=False, verbose_name="Ртуть (Минамата)")
    basel = models.BooleanField(default=False, verbose_name="Базельская конв.")
    history = HistoricalRecords()
    class Meta: verbose_name = "XVIII. Межд. регуляция"

class Sec20Docs(ConfigValidationMixin, models.Model):
    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec20_docs')
    gost_standards = models.TextField(blank=True, verbose_name="ГОСТы / Национальные документы")
    intl_docs = models.TextField(blank=True, verbose_name="Международные документы")
    history = HistoricalRecords()
    class Meta: verbose_name = "XX. Документы"

class Sec21Companies(ConfigValidationMixin, models.Model):
    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec21_companies')
    info = models.TextField(blank=True, verbose_name="Данные об участниках (произв./импорт.)")
    history = HistoricalRecords()
    class Meta: verbose_name = "XXI. Компании"

class Sec22Volumes(ConfigValidationMixin, models.Model):
    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec22_volumes')
    vol_production = models.CharField(max_length=100, blank=True, verbose_name="Объем производства")
    vol_import = models.CharField(max_length=100, blank=True, verbose_name="Объем импорта")
    vol_export = models.CharField(max_length=100, blank=True, verbose_name="Объем экспорта")
    history = HistoricalRecords()
    class Meta: verbose_name = "XXII. Объемы"

class Sec23Extra(ConfigValidationMixin, models.Model):
    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec23_extra')
    recommendations = models.TextField(blank=True, verbose_name="Рекомендации / Альтернативы")
    history = HistoricalRecords()
    class Meta: verbose_name = "XXIII. Доп. инфо"