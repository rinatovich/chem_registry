import requests
from celery import shared_task
from django.core.mail import EmailMessage
from django.conf import settings
from .models import SupportTicket

@shared_task
def send_support_notification_task(ticket_id):
    try:
        # 1. Берем заявку
        ticket = SupportTicket.objects.select_related('user').get(id=ticket_id)

        # 2. Формируем данные
        # Главное - email из формы
        contact_email = ticket.contact_email or "Не указан"

        # Доп. инфо: зарегистрирован ли он?
        if ticket.user:
            auth_info = f"(Аккаунт: {ticket.user.username})"
        else:
            auth_info = "(Гость / Не авторизован)"

        # Текст сообщения
        text = (
            f"🆘 <b>Новая заявка #{ticket.id}</b>\n\n"
            f"📧 <b>Email для ответа:</b> {contact_email}\n"
            f"👤 <b>Статус:</b> {auth_info}\n"
            f"📌 <b>Тема:</b> {ticket.subject}\n\n"
            f"📝 <b>Сообщение:</b>\n{ticket.message}"
        )

        # 3. ОТПРАВКА В TELEGRAM
        bot_token = settings.TELEGRAM_BOT_TOKEN
        chat_id = settings.TELEGRAM_CHAT_ID

        if bot_token and chat_id:
            try:
                if ticket.file:
                    with ticket.file.open('rb') as f:
                        requests.post(
                            f"https://api.telegram.org/bot{bot_token}/sendDocument",
                            data={'chat_id': chat_id, 'caption': text, 'parse_mode': 'HTML'},
                            files={'document': f},
                            timeout=10
                        )
                else:
                    requests.post(
                        f"https://api.telegram.org/bot{bot_token}/sendMessage",
                        data={'chat_id': chat_id, 'text': text, 'parse_mode': 'HTML'},
                        timeout=10
                    )
            except Exception as e:
                print(f"TELEGRAM ERROR: {e}")

        # 4. ОТПРАВКА НА EMAIL (Админу)
        try:
            recipient = settings.SUPPORT_EMAIL
            email_body = text.replace('<b>', '').replace('</b>', '')

            email = EmailMessage(
                subject=f"[Support] {ticket.subject}",
                body=email_body,
                from_email=settings.EMAIL_HOST_USER,
                to=[recipient],
                reply_to=[contact_email] if ticket.contact_email else None # Чтобы при нажатии "Ответить" подставился email пользователя
            )

            if ticket.file:
                with ticket.file.open('rb') as f:
                    email.attach(ticket.file.name, f.read())

            email.send()
        except Exception as e:
            print(f"EMAIL ERROR: {e}")

        return "Done"

    except SupportTicket.DoesNotExist:
        return "Ticket not found"