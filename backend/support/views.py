from rest_framework import viewsets, mixins
from rest_framework.permissions import AllowAny # <--- ВАЖНО
from rest_framework.parsers import MultiPartParser, FormParser
from .models import SupportTicket
from .serializers import SupportTicketSerializer
from .tasks import send_support_notification_task

class SupportViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = SupportTicket.objects.all()
    serializer_class = SupportTicketSerializer
    permission_classes = [AllowAny] # <--- Разрешаем всем
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        ticket = serializer.save()
        send_support_notification_task.delay(ticket.id)