from django.conf import settings
from simple_history.models import HistoricalRecords
from django.db import models
from .common import ConfigValidationMixin


class ChemicalElement(ConfigValidationMixin, models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Черновик'
        PENDING = 'PENDING', 'На проверке'
        PUBLISHED = 'PUBLISHED', 'Опубликовано'
        REJECTED = 'REJECTED', 'Отклонено'

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Автор")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, verbose_name="Статус")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    # Основные поисковые поля
    cas_number = models.CharField(max_length=50, unique=True, null=True, blank=True, verbose_name="Номер CAS", db_index=True)
    primary_name_ru = models.CharField(max_length=500, verbose_name="Название вещества (RU)", db_index=True)
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.primary_name_ru} (CAS: {self.cas_number})"

    class Meta:
        verbose_name = "Химическое вещество"
        verbose_name_plural = "Химические вещества"
        ordering = ['-updated_at']


class ElementAttachment(models.Model):
    class DocType(models.TextChoices):
        PASSPORT = 'PASSPORT', 'Паспорт безопасности (MSDS)'
        CERTIFICATE = 'CERTIFICATE', 'Сертификат соответствия'
        LAB_PROTOCOL = 'LAB_PROTOCOL', 'Протокол испытаний'
        DECLARATION = 'DECLARATION', 'Декларация'
        OTHER = 'OTHER', 'Другое'

    element = models.ForeignKey(ChemicalElement, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='documents/%Y/%m/', verbose_name="Файл")
    description = models.CharField(max_length=255, blank=True, verbose_name="Описание")
    doc_type = models.CharField(max_length=50, choices=DocType.choices, default=DocType.OTHER, verbose_name="Тип")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    history = HistoricalRecords()
    def __str__(self): return self.file.name
    class Meta: verbose_name = "Файл"; verbose_name_plural = "Файлы"