from rest_framework import serializers
from .models import * # Импорт всех моделей (Sec1, Sec2...)

# 1. Генерируем простые сериалайзеры для секций
# (Можно использовать factory или классы, для надежности напишу явно пару штук)
class Sec1Serializer(serializers.ModelSerializer):
    class Meta: model = Sec1Identification; exclude = ('element', 'id')

class Sec2Serializer(serializers.ModelSerializer):
    class Meta: model = Sec2Physical; exclude = ('element', 'id')

# Для тестов этого хватит, для продакшена надо все

class ChemicalElementListSerializer(serializers.ModelSerializer):
    hazard_class = serializers.CharField(source='sec11_class.get_sanpin_class_display', read_only=True)
    author_name = serializers.CharField(source='created_by.company_name', read_only=True)
    def get_author_name(self, obj):
            user = obj.created_by
            try:
                # Пытаемся вернуть название компании
                if hasattr(user, 'company_profile'):
                    return user.company_profile.company_name
            except:
                pass
            # Если компании нет, возвращаем логин (fallback)
            return user.username

    class Meta:
        model = ChemicalElement
        fields = ('id', 'cas_number', 'primary_name_ru', 'status', 'updated_at', 'hazard_class', 'author_name')

class ChemicalElementDetailSerializer(serializers.ModelSerializer):
    # Явно подключаем секции, чтобы они были Writable
    sec1_identification = Sec1Serializer(required=False)
    sec2_physical = Sec2Serializer(required=False)
    # ... остальные ...

    class Meta:
        model = ChemicalElement
        fields = '__all__'
        read_only_fields = ('status', 'created_by', 'updated_at')

    def create(self, validated_data):
        # Выдергиваем данные
        s1 = validated_data.pop('sec1_identification', {})
        s2 = validated_data.pop('sec2_physical', {})

        element = ChemicalElement.objects.create(**validated_data)

        # Создаем (update_or_create чтобы не дублировать)
        Sec1Identification.objects.update_or_create(element=element, defaults=s1)
        Sec2Physical.objects.update_or_create(element=element, defaults=s2)

        # Заглушки для остальных
        for rel in element._meta.related_objects:
            if rel.one_to_one and not hasattr(element, rel.name):
                rel.related_model.objects.create(element=element)

        return element

    def update(self, instance, validated_data):
        s1 = validated_data.pop('sec1_identification', {})
        s2 = validated_data.pop('sec2_physical', {})

        instance = super().update(instance, validated_data)

        if s1:
            Sec1Identification.objects.update_or_create(element=instance, defaults=s1)
        if s2:
            Sec2Physical.objects.update_or_create(element=instance, defaults=s2)

        return instance