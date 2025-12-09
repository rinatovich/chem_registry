import pytest
from unittest.mock import patch
from django.core import mail
from registry.models import ChemicalElement
from registry.tasks import send_status_email_task

@pytest.mark.django_db(transaction=True) # Важно: transaction=True для тестирования on_commit
class TestSignalsAndTasks:

    def test_signal_queues_email_on_publish(self, supplier, admin_user):
        """
        Проверяем, что при смене статуса на PUBLISHED вызывается задача Celery
        """
        elem = ChemicalElement.objects.create(
            primary_name_ru="Waiting Element",
            created_by=supplier,
            status='PENDING'
        )

        # Мокаем задачу Celery, чтобы не запускать её реально, а просто проверить вызов
        with patch('registry.tasks.send_status_email_task.delay') as mock_task:
            # Действие: Админ публикует элемент
            elem.status = 'PUBLISHED'
            elem.save()

            # Проверка: Задача была вызвана
            mock_task.assert_called_once()
            # Проверяем аргументы (email, subject, message)
            args = mock_task.call_args[0]
            assert args[0] == supplier.email
            assert "ОПУБЛИКОВАНО" in args[2]

    def test_email_task_execution(self):
        """Проверяем саму задачу Celery (что она реально шлет письмо)"""
        subject = "Test Subject"
        msg = "Test Body"
        email = "test@example.com"

        # Вызываем функцию задачи напрямую (синхронно)
        result = send_status_email_task(email, subject, msg)

        # Проверяем outbox django
        assert len(mail.outbox) == 1
        assert mail.outbox[0].subject == subject
        assert mail.outbox[0].to == [email]
        assert "Email sent" in result