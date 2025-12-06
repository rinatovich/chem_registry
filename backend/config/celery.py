import os
from celery import Celery

# Устанавливаем настройки Django по умолчанию
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')

# Используем настройки из settings.py, начинающиеся с CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# Автоматически находить задачи в файлах tasks.py внутри приложений
app.autodiscover_tasks()