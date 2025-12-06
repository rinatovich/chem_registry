from django.apps import AppConfig

class RegistryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'registry'

    # --- ВОТ ЭТОГО МЕТОДА СКОРЕЕ ВСЕГО НЕТ ИЛИ ОН НЕПОЛНЫЙ ---
    def ready(self):
        try:
            import registry.signals  # <--- ВАЖНЕЙШАЯ СТРОКА
            print("--- Signals Loaded Successfully ---") # Для отладки в логах
        except ImportError:
            pass