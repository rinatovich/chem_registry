from rest_framework import serializers
from .models import SupportTicket

class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ['id', 'subject', 'message', 'file', 'created_at', 'contact_email']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')

        # 1. Привязываем юзера только для истории (если он есть)
        if request and request.user and request.user.is_authenticated:
            validated_data['user'] = request.user
        else:
            validated_data['user'] = None

        # 2. ВАЖНО: Если email не пришел из формы, пытаемся взять из профиля (как запасной вариант)
        # Но если в форме что-то было написано, оно останется приоритетным.
        if not validated_data.get('contact_email'):
            if validated_data['user']:
                validated_data['contact_email'] = validated_data['user'].email

        return super().create(validated_data)