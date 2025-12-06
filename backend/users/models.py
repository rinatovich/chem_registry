from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = 'ADMIN', 'Администратор'
        SUPPLIER = 'SUPPLIER', 'Поставщик (Юр.лицо)' # Единая роль для всех типов бизнеса
        USER = 'USER', 'Обычный пользователь'

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.USER,
        verbose_name="Роль"
    )

    def __str__(self):
        return self.username

# --- НОВАЯ МОДЕЛЬ: ПРОФИЛЬ КОМПАНИИ ---
class CompanyProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='company_profile')

    # Юридические данные
    company_name = models.CharField(max_length=255, verbose_name="Название организации")
    inn = models.CharField(max_length=20, verbose_name="ИНН", unique=True)
    address = models.TextField(blank=True, verbose_name="Юридический адрес")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Телефон")
    website = models.URLField(blank=True, verbose_name="Сайт")

    # Тип деятельности (Множественный выбор)
    is_manufacturer = models.BooleanField(default=False, verbose_name="Мы - Производитель")
    is_importer = models.BooleanField(default=False, verbose_name="Мы - Импортер")
    is_exporter = models.BooleanField(default=False, verbose_name="Мы - Экспортер")

    def __str__(self):
        types = []
        if self.is_manufacturer: types.append("Производитель")
        if self.is_importer: types.append("Импортер")
        if self.is_exporter: types.append("Экспортер")
        return f"{self.company_name} ({', '.join(types)})"