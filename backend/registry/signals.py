from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import ChemicalElement

@receiver(pre_save, sender=ChemicalElement)
def notify_status_change(sender, instance, **kwargs):
    # Пытаемся получить старую версию объекта из БД
    if not instance.pk:
        return # Это создание нового, не меняем статус

    try:
        old_instance = ChemicalElement.objects.get(pk=instance.pk)
    except ChemicalElement.DoesNotExist:
        return

    # Если статус изменился
    if old_instance.status != instance.status:
        subject = f"Изменение статуса вещества: {instance.primary_name_ru}"
        message = ""

        if instance.status == 'PUBLISHED':
            message = f"Поздравляем! Ваше вещество '{instance.primary_name_ru}' успешно прошло проверку и ОПУБЛИКОВАНО в Национальном реестре."
        elif instance.status == 'REJECTED':
            message = f"Внимание. Ваше вещество '{instance.primary_name_ru}' ОТКЛОНЕНО модератором. Проверьте данные и отправьте повторно."
        elif instance.status == 'PENDING':
            # Можно отправить письмо админам
            pass

        if message and instance.created_by.email:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [instance.created_by.email], # Кому
                fail_silently=True,
            )
            print(f"--- EMAIL SENT TO {instance.created_by.email} ---")