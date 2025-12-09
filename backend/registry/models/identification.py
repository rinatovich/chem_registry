from .core import ChemicalElement
from django.db import models
from simple_history.models import HistoricalRecords
from .common import ConfigValidationMixin

class Sec1Identification(ConfigValidationMixin, models.Model):
    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec1_identification')

    structure_image = models.ImageField(upload_to='structures/', blank=True, null=True, verbose_name="Иллюстрация структуры")
    synonyms = models.TextField(blank=True, verbose_name="Синонимы (через запятую)")
    molecular_formula = models.CharField(max_length=255, blank=True, verbose_name="Молекулярная формула")
    structural_formula = models.TextField(blank=True, verbose_name="Структурная формула")
    ec_number = models.CharField(max_length=50, blank=True, verbose_name="Номер ЕС")
    iupac_name_ru = models.TextField(blank=True, verbose_name="IUPAC (RU)")
    iupac_name_en = models.TextField(blank=True, verbose_name="IUPAC (EN)")
    tnved_code = models.CharField(max_length=50, blank=True, verbose_name="Код ТН ВЭД")
    rtecs_link = models.CharField(max_length=255, blank=True, verbose_name="RTECS")
    history = HistoricalRecords()

    class Meta: verbose_name = "I. Идентификация"