from django.db import models
from django.conf import settings

class SupportTicket(models.Model):
    # Поле user может быть пустым
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Пользователь")

    # Поле contact_email ОБЯЗАТЕЛЬНО ДОЛЖНО БЫТЬ ЗДЕСЬ
    contact_email = models.EmailField(verbose_name="Email для связи", blank=True, null=True)

    subject = models.CharField(max_length=255, verbose_name="Тема")
    message = models.TextField(verbose_name="Сообщение")
    file = models.FileField(upload_to='support/%Y/%m/', null=True, blank=True, verbose_name="Скриншот/Файл")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создано")
    is_resolved = models.BooleanField(default=False, verbose_name="Решено")

    def __str__(self):
        return f"Ticket #{self.id} - {self.subject}"

    class Meta:
        verbose_name = "Обращение в поддержку"
        verbose_name_plural = "Обращения в поддержку"
        ordering = ['-created_at']