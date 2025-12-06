from .core import *
from .common  import *
from simple_history.models import HistoricalRecords
from django.db import models
from .common import ConfigValidationMixin

class Sec2Physical(ConfigValidationMixin, models.Model):
    class Appearance(models.TextChoices):
        SOLID = 'SOLID', 'Твердое вещество'
        LIQUID = 'LIQUID', 'Жидкость'
        GAS = 'GAS', 'Газ'
        VAPOR = 'VAPOR', 'Пар'
        AEROSOL = 'AEROSOL', 'Аэрозоль'

    class Odor(models.TextChoices):
        ODORLESS = 'NONE', 'Без запаха'
        SHARP = 'SHARP', 'Резкий'
        SPECIFIC = 'SPECIFIC', 'Специфический'
        FRUIT = 'FRUIT', 'Фруктовый'
        OTHER = 'OTHER', 'Другое (см. описание)'

    element = models.OneToOneField(ChemicalElement, on_delete=models.CASCADE, related_name='sec2_physical')

    appearance = models.CharField(max_length=50, choices=Appearance.choices, blank=True, verbose_name="Агрегатное состояние")
    odor = models.CharField(max_length=50, choices=Odor.choices, default=Odor.OTHER, verbose_name="Запах")

    color = models.CharField(max_length=100, blank=True, verbose_name="Цвет")
    ph = models.CharField(max_length=100, blank=True, verbose_name="pH")
    mol_mass = models.CharField(max_length=100, blank=True, verbose_name="Молекулярная масса")

    boiling_point = models.CharField(max_length=100, blank=True, verbose_name="Т кипения (°C)")
    melting_point = models.CharField(max_length=100, blank=True, verbose_name="Т плавления (°C)")
    auto_ignition = models.CharField(max_length=100, blank=True, verbose_name="Т самовоспламенения (°C)")

    density = models.CharField(max_length=100, blank=True, verbose_name="Плотность (г/см3)")
    solubility_water = models.CharField(max_length=255, blank=True, verbose_name="Растворимость в воде")
    history = HistoricalRecords()

    class Meta: verbose_name = "II. Физ-хим свойства"