from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.db import transaction
from .models import ChemicalElement
from .tasks import send_status_email_task

@receiver(pre_save, sender=ChemicalElement)
def notify_status_change(sender, instance, **kwargs):
    # Если объект новый (еще нет PK), то не с чем сравнивать
    if not instance.pk:
        return

    try:
        # Получаем старую версию из БД
        old_instance = ChemicalElement.objects.get(pk=instance.pk)
    except ChemicalElement.DoesNotExist:
        return

    # Если статус изменился
    if old_instance.status != instance.status:
        # Формируем тему и тело письма
        subject = f"Изменение статуса вещества: {instance.primary_name_ru}"
        message = ""

        if instance.status == 'PUBLISHED':
            message = (
                f"Здравствуйте, {instance.created_by.username}!\n\n"
                f"Ваше вещество '{instance.primary_name_ru}' (CAS: {instance.cas_number or 'Нет'}) "
                f"успешно прошло проверку и получило статус ОПУБЛИКОВАНО.\n\n"
                f"Теперь оно доступно в Национальном реестре."
            )
        elif instance.status == 'REJECTED':
            message = (
                f"Здравствуйте, {instance.created_by.username}.\n\n"
                f"К сожалению, модерация вещества '{instance.primary_name_ru}' была отклонена.\n"
                f"Пожалуйста, проверьте корректность данных и попробуйте снова."
            )

        # Если сообщение сформировано и у пользователя есть email
        if message and instance.created_by.email:
            # Важно: используем on_commit. Задача уйдет в Celery только если транзакция БД успешно завершится.
            transaction.on_commit(
                lambda: send_status_email_task.delay(
                    instance.created_by.email,
                    subject,
                    message
                )
            )