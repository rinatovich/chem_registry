import os
from django.conf import settings
from django.db.models import Count, TextField, Value, Q
from django.db.models.functions import Cast, Coalesce
from django.contrib.postgres.search import TrigramSimilarity
from django.template.loader import render_to_string
from django.http import HttpResponse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

from rest_framework import viewsets, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from celery.result import AsyncResult
from django_filters.rest_framework import DjangoFilterBackend
from weasyprint import HTML

# Ваши импорты
from .models import ChemicalElement, RegistryConfig, Sec2Physical
from .permissions import IsOwnerOrReadOnly, IsControllerOrAdmin
from .serializers import ChemicalElementDetailSerializer, ChemicalElementListSerializer
from .services import generate_excel_template
from .tasks import import_excel_task

# === ИМПОРТ КАРТЫ ПОЛЕЙ ===
from .structures import SECTION_MAP

# 1. API ДЛЯ КОЛОНОК (Вот здесь была проблема 500)
class PublicConfigView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        config = RegistryConfig.objects.first()
        # Защита: если конфиг еще не создан в админке или поля нет в базе
        public_fields = []
        if config and hasattr(config, 'public_list_fields'):
             public_fields = config.public_list_fields or []

        # Системное поле (Название) всегда показываем первым
        if 'primary_name_ru' not in public_fields:
            public_fields.insert(0, 'primary_name_ru')

        columns = []
        # Собираем словарь: код_поля -> Красивое Название
        LABELS = {}
        for _, _, _, fields_list in SECTION_MAP:
            for excel_name, db_name, _ in fields_list:
                LABELS[db_name] = excel_name

        # Формируем JSON
        for field in public_fields:
            columns.append({
                "field": field,
                "headerName": LABELS.get(field, field),
                "minWidth": 150
            })

        return Response(columns)

# 2. СТАТИСТИКА
class StatisticsView(APIView):
    permission_classes = [AllowAny]
    @method_decorator(cache_page(60 * 15))
    def get(self, request):
        qs = ChemicalElement.objects.filter(status='PUBLISHED')
        return Response({
            "total_elements": qs.count(),
            "hazard_distribution": qs.values('sec11_class__sanpin_class').annotate(count=Count('id'))
        })

# ... (Остальные Views: Template, Import, TaskStatus, ViewSet) ...
# (Оставьте их такими же, как мы делали рабочими в прошлый раз)
# Не забудьте в ViewSet импорты
class DownloadTemplateView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        wb = generate_excel_template()
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename=tmpl.xlsx'
        wb.save(response)
        return response

class ImportElementsView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    def post(self, request):
        f = request.FILES.get('file')
        if not f: return Response({"error":"no file"}, 400)
        p = default_storage.save(f"imports/{request.user.id}_{f.name}", ContentFile(f.read()))
        task = import_excel_task.delay(p, request.user.id)
        return Response({"task_id": task.id}, 202)

class TaskStatusView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, req, task_id):
        res = AsyncResult(task_id)
        data = {'status': res.status}
        if res.ready(): data['result'] = res.result
        return Response(data)

class ChemicalElementViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOwnerOrReadOnly]
    def get_serializer_class(self): return ChemicalElementDetailSerializer if self.action!='list' else ChemicalElementListSerializer

    def get_queryset(self):
        user = self.request.user
        qs = ChemicalElement.objects.filter(status='PUBLISHED')
        if user.is_authenticated:
             qs = ChemicalElement.objects.filter(Q(status='PUBLISHED')|Q(created_by=user))

        q = self.request.query_params.get('search')
        if q:
            qs = qs.annotate(
                similarity=TrigramSimilarity(Cast('primary_name_ru', TextField()), q)
            ).filter(similarity__gt=0.01).order_by('-similarity')
        return qs

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def pdf(self, r, pk=None):
        elem = self.get_object()
        html = render_to_string('registry/passport_pdf.html', {'element': elem})
        return HttpResponse(HTML(string=html, base_url=r.build_absolute_uri('/')).write_pdf(), content_type='application/pdf')