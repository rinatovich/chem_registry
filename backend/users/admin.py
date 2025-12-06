from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, CompanyProfile

# 1. Инлайн для Компании
# Это позволит редактировать ИНН и Адрес прямо на странице пользователя
class CompanyProfileInline(admin.StackedInline):
    model = CompanyProfile
    can_delete = False
    verbose_name_plural = 'Профиль Компании (Юр. Лицо)'
    fk_name = 'user'
    extra = 0  # Не показывать, если профиля нет (для админов), или 1 чтобы создать

# 2. Настройка Админки Пользователя
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Добавляем наш инлайн внутрь
    inlines = [CompanyProfileInline]

    # Какие колонки показывать в списке
    list_display = ('username', 'email', 'role', 'get_company_name', 'is_staff', 'is_active')

    # Фильтры справа
    list_filter = ('role', 'is_staff', 'is_active', 'company_profile__is_manufacturer')

    # Поиск (по юзернейму, почте и названию компании)
    search_fields = ('username', 'email', 'company_profile__company_name', 'company_profile__inn')

    # Настройка формы редактирования
    # Берем стандартные поля UserAdmin (пароль, права) и добавляем наше поле Role
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Роль в системе', {'fields': ('role',)}), # <--- НАШЕ ПОЛЕ
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    # Хелпер, чтобы вывести название компании в списке
    def get_company_name(self, obj):
        if hasattr(obj, 'company_profile'):
            return f"{obj.company_profile.company_name} (ИНН: {obj.company_profile.inn})"
        return "-"
    get_company_name.short_description = "Организация"

    # При создании пользователя
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {
            'classes': ('wide',),
            'fields': ('role',),
        }),
    )