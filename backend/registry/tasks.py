import io
import os
from celery import shared_task
from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.core.mail import send_mail
from django.conf import settings
from .services import process_excel_import

User = get_user_model()

@shared_task(bind=True)
def import_excel_task(self, file_path_key, user_id):
    try:
        user = User.objects.get(id=user_id)

        # Статус: Скачивание
        self.update_state(state='PROGRESS', meta={'progress': 5, 'message': 'Скачивание...'})

        if not default_storage.exists(file_path_key):
             return {"imported": 0, "errors": [f"Файл не найден: {file_path_key}"]}

        # Скачиваем из S3/MinIO в память
        with default_storage.open(file_path_key, 'rb') as f:
            file_content = f.read()

        file_in_memory = io.BytesIO(file_content)

        # Статус: Парсинг
        self.update_state(state='PROGRESS', meta={'progress': 10, 'message': 'Парсинг Excel...'})

        # Запуск сервиса
        report = process_excel_import(file_in_memory, user)

        # Чистим за собой (удаляем временный файл из S3)
        default_storage.delete(file_path_key)

        return {
            "status": "DONE",
            "imported": report.get('success', 0),
            "errors": report.get('errors', [])
        }

    except Exception as e:
        return {"imported": 0, "errors": [f"Системная ошибка: {str(e)}"]}


@shared_task
def send_status_email_task(user_email, subject, message):
    """
    Асинхронная отправка письма через Celery.
    Если SMTP зависнет, это не повлияет на работу админки.
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user_email],
            fail_silently=False,
        )
        return f"Email sent to {user_email}"
    except Exception as e:
        # Логируем ошибку, если письмо не ушло (можно подключить logging)
        print(f"ERROR sending email to {user_email}: {e}")
        return f"Failed: {e}"