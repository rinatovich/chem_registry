from django.db import migrations
from django.contrib.postgres.operations import TrigramExtension # <--- ВАЖНЫЙ ИМПОРТ

class Migration(migrations.Migration):

    dependencies = [
        ('registry', '0002_registryconfig_template_fields'), # Зависит от вашей последней миграции
        # Если у вас нет 0001_initial, посмотрите имя файла предыдущей миграции
    ]

    operations = [
        TrigramExtension(), # <--- ВОТ ЭТО ГЛАВНОЕ
    ]