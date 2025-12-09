import os
from django.conf import settings
from django.db.models import Count, TextField, Value, Q, F
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
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from celery.result import AsyncResult
from weasyprint import HTML

from .models import ChemicalElement, RegistryConfig, ElementAttachment, Sec1Identification
from .permissions import IsOwnerOrReadOnly
from .serializers import (
    ChemicalElementDetailSerializer,
    ChemicalElementListSerializer,
    ElementAttachmentSerializer
)
from .services import generate_excel_template
from .tasks import import_excel_task
from .structures import SECTION_MAP


# 1. API ДЛЯ КОЛОНОК (Кэшируем на 24 часа, меняется редко)
class PublicConfigView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(cache_page(60 * 60 * 24))
    def get(self, request):
        config = RegistryConfig.objects.first()
        public_fields = []
        if config and hasattr(config, 'public_list_fields'):
             public_fields = config.public_list_fields or []

        if 'primary_name_ru' not in public_fields:
            public_fields.insert(0, 'primary_name_ru')

        columns = []
        LABELS = {}
        for _, _, _, fields_list in SECTION_MAP:
            for excel_name, db_name, _ in fields_list:
                LABELS[db_name] = excel_name

        for field in public_fields:
            columns.append({
                "field": field,
                "headerName": LABELS.get(field, field),
                "minWidth": 150
            })

        return Response(columns)


# 2. СТАТИСТИКА (Кэш 15 минут)
class StatisticsView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(cache_page(60 * 15))
    def get(self, request):
        qs = ChemicalElement.objects.filter(status='PUBLISHED')
        return Response({
            "total_elements": qs.count(),
            "hazard_distribution": qs.values('sec11_class__sanpin_class').annotate(count=Count('id'))
        })


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

        file_path = f"imports/{request.user.id}_{f.name}"
        saved_path = default_storage.save(file_path, ContentFile(f.read()))

        task = import_excel_task.delay(saved_path, request.user.id)
        return Response({"task_id": task.id}, 202)


class TaskStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, req, task_id):
        res = AsyncResult(task_id)
        data = {'status': res.status}
        if res.ready():
            data['result'] = res.result
        return Response(data)


class ChemicalElementViewSet(viewsets.ModelViewSet):
    permission_classes = [IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        # Оптимизация: Для списка используем легкий сериалайзер
        if self.action == 'list':
            return ChemicalElementListSerializer
        return ChemicalElementDetailSerializer

    def get_queryset(self):
        user = self.request.user
        qs = ChemicalElement.objects.all()

        # 1. ГЛАВНАЯ ОПТИМИЗАЦИЯ (Решение проблемы N+1)
        # Если мы запрашиваем один элемент (retrieve) или редактируем -> грузим все секции
        if self.action in ['retrieve', 'update', 'partial_update']:
            qs = qs.select_related(
                'sec1_identification', 'sec2_physical', 'sec3_sanpin', 'sec4_air',
                'sec5_acute', 'sec6_risks', 'sec8_ecotox', 'sec9_soil',
                'sec10_water', 'sec11_class', 'sec12_ghs', 'sec13_label',
                'sec14_safety', 'sec15_storage', 'sec16_waste', 'sec17_incidents',
                'sec18_intl', 'sec20_docs', 'sec21_companies', 'sec22_volumes',
                'sec23_extra',
                'created_by', 'created_by__company_profile'
            ).prefetch_related('attachments')
        else:
            # Для списка (list) грузим ТОЛЬКО автора и организацию
            qs = qs.select_related('created_by', 'created_by__company_profile')
            # Если нужно показывать hazard_class в списке, джойним только эту таблицу
            qs = qs.select_related('sec11_class')

        # 2. PERMISSIONS
        if user.is_staff:
            pass
        elif user.is_authenticated:
            qs = qs.filter(Q(status='PUBLISHED') | Q(created_by=user))
        else:
            qs = qs.filter(status='PUBLISHED')

        # 3. SMART SEARCH (ОПТИМИЗИРОВАННЫЙ)
        q = self.request.query_params.get('search')
        if q:
            q = q.strip()
            # Базовый быстрый поиск (использует индексы)
            base_search = Q(primary_name_ru__icontains=q) | Q(cas_number__icontains=q)

            # Расширенный поиск по другим полям (если настроено)
            config = RegistryConfig.objects.first()
            if config and config.public_list_fields:
                extra_search = Q()
                searchable_fields = set(config.public_list_fields)
                # Убираем уже добавленные в base_search
                searchable_fields.discard('primary_name_ru')
                searchable_fields.discard('cas_number')

                for _, _, model_cls, fields_list in SECTION_MAP:
                    if model_cls == ChemicalElement: continue # Пропускаем, уже обработали

                    prefix = ""
                    try:
                        prefix = model_cls._meta.get_field('element').remote_field.name + "__"
                    except: continue

                    for _, db_field, _ in fields_list:
                        if db_field in searchable_fields:
                            extra_search |= Q(**{f"{prefix}{db_field}__icontains": q})

                qs = qs.filter(base_search | extra_search).distinct()
            else:
                # Если конфига нет, ищем только по базе + синонимам (самое чаcтое)
                qs = qs.filter(
                    base_search |
                    Q(sec1_identification__synonyms__icontains=q) |
                    Q(sec1_identification__molecular_formula__icontains=q)
                ).distinct()

        # 4. ФИЛЬТРАЦИЯ ПО ПОЛЯМ (FACETS)
        FIELD_LOOKUP_MAP = {}
        for _, _, model_cls, fields_list in SECTION_MAP:
            prefix = ""
            if model_cls != ChemicalElement:
                try:
                    prefix = model_cls._meta.get_field('element').remote_field.name + "__"
                except: continue

            for _, db_field, _ in fields_list:
                FIELD_LOOKUP_MAP[db_field] = prefix + db_field

        for param, value in self.request.query_params.items():
            if param in FIELD_LOOKUP_MAP and value:
                lookup = FIELD_LOOKUP_MAP[param]
                if str(value).lower() == 'true':
                    qs = qs.filter(**{lookup: True})
                elif str(value).lower() == 'false':
                    qs = qs.filter(**{lookup: False})
                else:
                    qs = qs.filter(**{lookup: value})

        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    # === ЗАГРУЗКА СТРУКТУРЫ (ИЗОБРАЖЕНИЕ) ===
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_structure(self, request, pk=None):
        element = self.get_object()
        sec1, _ = Sec1Identification.objects.get_or_create(element=element)

        file = request.FILES.get('image')
        if not file:
            return Response({"error": "Файл не предоставлен"}, status=400)

        sec1.structure_image = file
        sec1.save()
        return Response({"status": "updated", "url": sec1.structure_image.url})

    # === ЗАГРУЗКА ВЛОЖЕНИЙ (PDF И Т.Д.) ===
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_attachment(self, request, pk=None):
        element = self.get_object()
        serializer = ElementAttachmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(element=element)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='delete_attachment/(?P<attachment_id>\d+)')
    def delete_attachment(self, request, pk=None, attachment_id=None):
        try:
            att = ElementAttachment.objects.get(pk=attachment_id, element_id=pk)
            att.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ElementAttachment.DoesNotExist:
            return Response({"error": "Файл не найден"}, status=status.HTTP_404_NOT_FOUND)

    # === ПОДСКАЗКИ (AUTOCOMPLETE) ===
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def suggest(self, request):
        q = request.query_params.get('search', '').strip()
        if len(q) < 2: return Response([])

        # Используем оптимизированный QS, но ограничиваем кол-во
        qs = ChemicalElement.objects.filter(
            Q(primary_name_ru__icontains=q) |
            Q(cas_number__icontains=q) |
            Q(status='PUBLISHED')
        ).select_related('created_by')[:10]

        suggestions = []
        for elem in qs:
            if q.lower() in elem.primary_name_ru.lower():
                suggestions.append({"label": elem.primary_name_ru, "type": "Вещество", "id": elem.id})
            elif elem.cas_number and q in elem.cas_number:
                suggestions.append({"label": f"{elem.cas_number} ({elem.primary_name_ru})", "type": "CAS", "id": elem.id})
            else:
                suggestions.append({"label": elem.primary_name_ru, "type": "Совпадение", "id": elem.id})

        # Убираем дубли
        seen = set()
        unique = []
        for s in suggestions:
            if s['label'] not in seen:
                unique.append(s)
                seen.add(s['label'])
        return Response(unique[:10])

    # === ФАСЕТЫ (СЧЕТЧИКИ ФИЛЬТРОВ) ===
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def facets(self, request):
        config = RegistryConfig.objects.first()
        if not config or not config.filter_fields:
            return Response({})

        filter_fields = config.filter_fields
        response_data = {}
        user = request.user
        qs = ChemicalElement.objects.all()

        if user.is_staff: pass
        elif user.is_authenticated: qs = qs.filter(Q(status='PUBLISHED') | Q(created_by=user))
        else: qs = qs.filter(status='PUBLISHED')

        q = request.query_params.get('search')
        if q:
            # Упрощенная фильтрация для фасетов (только по основным полям для скорости)
            qs = qs.filter(
                Q(primary_name_ru__icontains=q) |
                Q(cas_number__icontains=q)
            )

        # Перебираем поля и считаем агрегации
        for _, _, model_cls, fields_list in SECTION_MAP:
            prefix = ""
            if model_cls != ChemicalElement:
                try: prefix = model_cls._meta.get_field('element').remote_field.name + "__"
                except: continue

            for human_name, db_field, _ in fields_list:
                if db_field in filter_fields:
                    full_field = prefix + db_field
                    # Оптимизация: values + annotate работает быстрее, чем loop
                    counts = qs.values(full_field).annotate(count=Count('id')).order_by('-count')

                    model_field = model_cls._meta.get_field(db_field)
                    choices_dict = dict(model_field.choices) if model_field.choices else {}

                    field_options = []
                    for item in counts:
                        val = item[full_field]
                        if val is None or val == "": continue

                        label = choices_dict.get(val, val)
                        if val is True: label = "Да"
                        if val is False: label = "Нет"

                        field_options.append({
                            "value": val,
                            "label": str(label),
                            "count": item['count']
                        })

                    if field_options:
                        response_data[db_field] = {
                            "title": human_name,
                            "options": field_options
                        }

        return Response(response_data)

    # === ГЕНЕРАЦИЯ PDF ПАСПОРТА ===
    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def pdf(self, r, pk=None):
        # Для PDF нужно подгрузить все данные
        elem = ChemicalElement.objects.select_related(
            'sec1_identification', 'sec2_physical', 'sec3_sanpin', 'sec4_air',
            'sec5_acute', 'sec6_risks', 'sec8_ecotox', 'sec9_soil',
            'sec10_water', 'sec11_class', 'sec12_ghs', 'sec13_label',
            'sec14_safety', 'sec15_storage', 'sec16_waste', 'sec17_incidents',
            'sec18_intl', 'sec20_docs', 'sec21_companies', 'sec22_volumes',
            'sec23_extra'
        ).get(pk=pk)

        html = render_to_string('registry/passport_pdf.html', {'element': elem})
        # Используем base_url чтобы weasyprint мог найти картинки/шрифты
        pdf_file = HTML(string=html, base_url=r.build_absolute_uri('/')).write_pdf()

        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="passport_{pk}.pdf"'
        return response