from pathlib import Path
import os
from datetime import timedelta
import sys

if 'pytest' in sys.modules or 'test' in sys.argv:
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = True
    CELERY_TASK_STORE_EAGER_RESULT = True

    # Новая конфигурация для тестов (Локальное хранение)
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }
    MEDIA_ROOT = '/tmp/django_test_media'
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-a3zad5iz)-pjdkg*=dt_&ovu9ul&+tu#p1$i8w_x%v2y!d4*z('

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = [
   # Админка и базовые Django-приложения
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.postgres',

    'simple_history',               # История изменений моделей
    'rest_framework',               # DRF
    'rest_framework_simplejwt',     # JWT аутентификация
    'corsheaders',                  # CORS
    'drf_yasg',                     # Swagger документация
    'django_filters',               # Фильтры для DRF
    'storages',                     # Работа с S3/MinIO

    # Наши приложения
    'users',
    'registry',
    'constance',
    'constance.backends.database',
    'support',
]
EMAIL_BACKEND = os.environ.get('EMAIL_BACKEND',
    'django.core.mail.backends.console.EmailBackend' if DEBUG else 'django.core.mail.backends.smtp.EmailBackend'
)

EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_USE_SSL = os.environ.get('EMAIL_USE_SSL', 'False') == 'True'
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')

# Куда отправлять уведомления техподдержки
SUPPORT_EMAIL = os.environ.get('SUPPORT_EMAIL', EMAIL_HOST_USER)

# === TELEGRAM SETTINGS ===
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID')

CONSTANCE_BACKEND = 'constance.backends.database.DatabaseBackend'

CONSTANCE_CONFIG = {
    'REQUIRED_FIELDS': ('primary_name_ru,cas_number', 'Список обязательных полей через запятую (API/Импорт)'),
    'BLOCK_DRAFTS_WITHOUT_MANDATORY': (True, 'Запретить сохранять черновики без этих полей?'),
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    # По умолчанию - только для авторизованных
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20, # Размер страницы по умолчанию
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1), # Для удобства разработки - 1 день
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'simple_history.middleware.HistoryRequestMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': '5432',
    }
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'ru'


TIME_ZONE = 'Asia/Tashkent'

USE_I18N = True
USE_L10N = True # (Если есть, оставьте)
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.User'

ALLOWED_HOSTS = ['*']  # Разрешаем доступ из контейнера
CORS_ALLOW_ALL_ORIGINS = True  # Чтобы API был доступен всем

# URL, по которому файлы будут доступны в браузере (например /media/doc.pdf)
# MEDIA_URL = '/media/'

# Физическая папка внутри контейнера, где лежат файлы
# MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

JAZZMIN_SETTINGS = {
    # Заголовки
    "site_title": "Реестр ОХВ",
    "site_header": "Национальный Реестр",
    "site_brand": "ChemRegistry",
    "welcome_sign": "Добро пожаловать в панель управления Реестром",
    "copyright": "Chemical Registry Ltd",

    # Логотип (можно потом положить файл в статику, пока текстом)
    # "site_logo": "img/logo.png",

    # Меню
    "search_model": "registry.ChemicalElement",  # Глобальный поиск по элементам

    # Топ-меню
    "topmenu_links": [
        {"name": "Главная",  "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "Открыть сайт", "url": "/"},
    ],

    # Боковое меню
    "show_sidebar": True,
    "navigation_expanded": True,

    # Иконки для меню (используем FontAwesome)
    "icons": {
        "auth": "fas fa-users-cog",
        "users.User": "fas fa-user",
        "registry.ChemicalElement": "fas fa-flask",        # Иконка колбы
        "registry.ElementAttachment": "fas fa-file-pdf",   # Иконка файла
        # Для остальных моделей можно настроить скрытие или иконки
    },

    # Порядок меню
    "order_with_respect_to": ["registry", "users", "auth"],
}

JAZZMIN_UI_TWEAKS = {
    "theme": "flatly",        # Тема: светлая, строгая, научная (варианты: darkly, simplex, cerulean)
    "navbar": "navbar-dark",  # Темная верхняя панель
}

SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    },
    'USE_SESSION_AUTH': False,
    'JSON_EDITOR': True,
    'SUPPORT_GENERATED_MEDIA_TYPES': True,
}

# Отключаем показ авторизации Django-сессии (мы используем токены)
LOGIN_URL = 'rest_framework:login'
LOGOUT_URL = 'rest_framework:logout'

# EMAIL SETTINGS
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_HOST_USER = 'no-reply@chem-registry.uz'


# === S3 SETTINGS (MINIO) ===

AWS_ACCESS_KEY_ID = 'minioadmin'
AWS_SECRET_ACCESS_KEY = 'minioadmin'
AWS_STORAGE_BUCKET_NAME = 'chem-media'
AWS_S3_ENDPOINT_URL = 'http://minio:9000'
AWS_S3_REGION_NAME = 'us-east-1'

# 1. Задаем домен (без http/https в начале)
AWS_S3_CUSTOM_DOMAIN = 'localhost:9000/chem-media'

# 2. ПРИНУДИТЕЛЬНО ВКЛЮЧАЕМ HTTP (БЕЗ SSL)
AWS_S3_USE_SSL = False       # Отключаем SSL для boto3
AWS_S3_URL_PROTOCOL = 'http:' # Явно указываем протокол для ссылок

# 3. Дополнительные настройки для "прямых" ссылок
AWS_QUERYSTRING_AUTH = False
AWS_S3_FILE_OVERWRITE = False

# Если мы НЕ в режиме тестов (pytest не запущен)
if 'pytest' not in sys.modules and 'test' not in sys.argv:
    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }

MEDIA_URL = 'http://localhost:9000/chem-media/'

# === CACHE (REDIS) ===
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://redis:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

# === CELERY SETTINGS UPDATE ===
# Брокер (Очередь) - RabbitMQ
CELERY_BROKER_URL = 'amqp://guest:guest@rabbitmq:5672//'
# Результаты (Result Backend) - Redis (храним 1 день)
CELERY_RESULT_BACKEND = 'redis://redis:6379/0'
CELERY_RESULT_EXPIRES = 86400