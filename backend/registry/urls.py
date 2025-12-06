from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DownloadTemplateView, ImportElementsView,
    ChemicalElementViewSet, StatisticsView, TaskStatusView, PublicConfigView
)

router = DefaultRouter()
router.register(r'elements', ChemicalElementViewSet, basename='element')

urlpatterns = [
    path('', include(router.urls)),

    # Импорт и экспорт
    path('import/template/', DownloadTemplateView.as_view(), name='download-template'),
    path('import/upload/', ImportElementsView.as_view(), name='import-upload'),

    # Новое: Асинхронный статус и Статистика
    path('tasks/<str:task_id>/', TaskStatusView.as_view(), name='task-status'),
    path('stats/', StatisticsView.as_view(), name='statistics'),
    path('tasks/<str:task_id>/', TaskStatusView.as_view(), name='task-status'),
    path('stats/', StatisticsView.as_view(), name='stats'),
    path('config/', PublicConfigView.as_view()),
]