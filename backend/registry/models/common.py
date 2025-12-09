from django.db import models
from django.core.exceptions import ValidationError

class HazardClassChoices(models.TextChoices):
    CLASS_1 = '1', '1 - Чрезвычайно опасные'
    CLASS_2 = '2', '2 - Высокоопасные'
    CLASS_3 = '3', '3 - Умеренно опасные'
    CLASS_4 = '4', '4 - Малоопасные'
    NC = 'NC', 'Не классифицируется'  # <--- БЫЛО ИСПРАВЛЕНО ЗДЕСЬ (NOT_CLASSIFIED -> NC)

class YesNoUnknown(models.TextChoices):
    YES = 'YES', 'Да / Воздействует'
    NO = 'NO', 'Нет / Не воздействует'
    UNKNOWN = 'UNKNOWN', 'Нет сведений'

class CategoriesGHS(models.TextChoices):
    CAT_1 = '1', 'Категория 1'
    CAT_1A = '1A', 'Категория 1A'
    CAT_1B = '1B', 'Категория 1B'
    CAT_2 = '2', 'Категория 2'
    CAT_3 = '3', 'Категория 3'
    NC = 'NC', 'Не классифицируется'


class RegistryConfig(models.Model):
    """
    Модель для глобальных настроек Реестра.
    Реализует паттерн Singleton (всегда только 1 запись).
    """
    # Здесь мы будем хранить список полей, которые админ отметил как обязательные
    # Пример: ["cas_number", "ph", "pdk_workzone"]
    required_fields = models.JSONField(default=list, blank=True, verbose_name="Обязательные поля для заполнения")
    template_fields = models.JSONField(default=list, blank=True, verbose_name="Колонки в шаблоне Excel")
    public_list_fields = models.JSONField(default=list, blank=True, verbose_name="Поля Публичной Таблицы")
    filter_fields = models.JSONField(default=list, blank=True, verbose_name="Поля для Фильтров (Сайдбар)")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления настроек")

    def save(self, *args, **kwargs):
        # Гарантируем, что запись всегда одна (ID=1)
        self.pk = 1
        super(RegistryConfig, self).save(*args, **kwargs)

    def __str__(self):
        return "Глобальные настройки импорта и валидации"

    class Meta:
        verbose_name = "Настройка Обязательных Полей"
        verbose_name_plural = "Настройка Обязательных Полей"


class ConfigValidationMixin:
    """
    Миксин, который добавляет проверку обязательных полей через настройки.
    Подключаем его ко всем моделям (Разделам и Главной).
    """
    def clean(self):
        # 1. Загружаем настройки (Список строк: ['cas_number', 'ph', ...])
        try:
            # Импортируем внутри метода, чтобы избежать кольцевых ссылок при старте Django
            from registry.models import RegistryConfig
            config = RegistryConfig.objects.first()
            if not config:
                super().clean()
                return
            required_list = config.required_fields
        except Exception:
            super().clean()
            return

        # 2. Получаем все поля ТЕКУЩЕЙ модели
        # (Например, если self это Sec2Physical, тут будут 'ph', 'odor' и т.д.)
        my_fields = [f.name for f in self._meta.get_fields()]

        # 3. Проверяем: есть ли среди обязательных наши поля?
        for field_name in required_list:
            if field_name in my_fields:
                # Получаем значение
                value = getattr(self, field_name)

                # Если значение пустое (None, "", False)
                # Примечание: Для BooleanField False считается значением, но если вам надо
                # заставить отметить галочку "Да", логику можно усложнить.
                # Пока проверяем на пустоту текста/выбора.
                if value is None or value == "":
                    raise ValidationError({
                        field_name: "Это поле отмечено как ОБЯЗАТЕЛЬНОЕ в настройках реестра."
                    })

        super().clean()