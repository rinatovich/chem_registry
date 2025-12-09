from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi


# Настройка информации о вашем API
schema_view = get_schema_view(
   openapi.Info(
      title="Chemical Registry API",
      default_version='v1',
      description="API Национального реестра химических веществ РУз.\n"
                  "Авторизация: Используйте кнопку 'Authorize' -> введите 'Bearer <ваш_токен>'",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@chem-registry.uz"),
      license=openapi.License(name="Private License"),
   ),
   public=True,
   permission_classes=[permissions.AllowAny], # Открыт для чтения (но методы внутри защищены)
)




urlpatterns = [
    path('admin/', admin.site.urls),
    # Ваши API URL-ы тут, пока не добавляли
    path('api/registry/', include('registry.urls')),

    # ...
    path('api/auth/', include('users.urls')), # <--- НОВАЯ СТРОКА
    path('api/token/', TokenObtainPairView.as_view()),
    # ...

    # === ДОБАВЛЯЕМ ЭТИ ДВЕ СТРОКИ ===
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # Логин
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 4. ДОКУМЕНТАЦИЯ
    # Сваггер (JSON)
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    # Сваггер (UI - красивый интерфейс)
    re_path(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    # Redoc (Аналог - только для чтения)
    re_path(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # Your app URLs...
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/support/', include('support.urls')),
]

# Если включен режим отладки, раздаем медиа-файлы
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)