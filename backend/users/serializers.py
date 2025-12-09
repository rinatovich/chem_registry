from rest_framework import serializers
from .models import User, CompanyProfile
from django.db import transaction

class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = ['company_name', 'inn', 'address', 'phone', 'is_manufacturer', 'is_importer', 'is_exporter', 'logo']
        # logo добавлено

class RegisterSupplierSerializer(serializers.ModelSerializer):
    company = CompanyProfileSerializer(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'company']

    def create(self, validated_data):
        company_data = validated_data.pop('company')
        password = validated_data.pop('password')
        with transaction.atomic():
            user = User.objects.create(
                **validated_data,
                role=User.Roles.SUPPLIER
            )
            user.set_password(password)
            user.save()
            CompanyProfile.objects.create(user=user, **company_data)
        return user

class CurrentUserSerializer(serializers.ModelSerializer):
    # ИСПРАВЛЕНИЕ: Используем SerializerMethodField для безопасного чтения
    company = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'company']
        read_only_fields = ['id', 'username', 'role']

    def get_company(self, obj):
        # Пытаемся получить профиль. Если его нет (как у админа) - возвращаем None
        try:
            return CompanyProfileSerializer(obj.company_profile).data
        except CompanyProfile.DoesNotExist:
            return None

    def update(self, instance, validated_data):
        # Обработка входящих данных (изменим логику для ручного разбора request.data во view или тут)
        # DRF сложно маппит запись в SerializerMethodField.
        # Чтобы не усложнять: для UPDATE мы берем данные из initial_data

        instance.email = validated_data.get('email', instance.email)
        instance.save()

        # Обновление компании
        # Мы ожидаем, что фронтенд пришлет JSON вида { "company": { ... } } или { "company_profile": ... }
        # Так как мы используем MethodField, валидатор его игнорирует, берем из контекста
        company_data = self.initial_data.get('company') or self.initial_data.get('company_profile')

        if company_data:
            # Если профиля нет, создаем его (на случай если админ хочет заполнить)
            profile, created = CompanyProfile.objects.get_or_create(user=instance)

            # Обновляем поля
            for attr, value in company_data.items():
                if hasattr(profile, attr):
                    setattr(profile, attr, value)
            profile.save()

        return instance