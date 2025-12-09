from django.contrib import admin
from django import forms
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from simple_history.admin import SimpleHistoryAdmin
from .models import *
from .structures import SECTION_MAP

# =========================================================
# 1. ЕДИНЫЙ ВИДЖЕТ (МАТРИЦА НАСТРОЕК)
# =========================================================
class MatrixConfigWidget(forms.Widget):
    def __init__(self, attrs=None, data_source=None):
        super().__init__(attrs)
        self.data_source = data_source or {}

    def render(self, name, value, attrs=None, renderer=None):
        # Загружаем текущие настройки
        curr_req = self.data_source.get('required', []) or []
        curr_vis = self.data_source.get('template', []) or []
        curr_pub = self.data_source.get('public', []) or []
        curr_flt = self.data_source.get('filters', []) or [] # <--- НОВОЕ: Фильтры

        html = [
            '<div class="matrix-wrapper">',
            '<table class="matrix-table" style="width:100%; border-collapse: collapse;">',
            '<thead>',
            '<tr>',
                '<th class="th-name" style="text-align:left; width:28%; padding:12px; background:#2c3e50; color:white;">Параметр / Поле</th>',
                '<th class="th-check" style="width:18%; background:#ffe6e6; color:black; border:1px solid #ddd;">Строго Обязательно</th>',
                '<th class="th-check" style="width:18%; background:#e6f2ff; color:black; border:1px solid #ddd;">В Excel Шаблоне</th>',
                '<th class="th-check" style="width:18%; background:#e6fffa; color:black; border:1px solid #ddd;">Публичная Таблица</th>',
                # НОВАЯ КОЛОНКА
                '<th class="th-check" style="width:18%; background:#fff9db; color:black; border:1px solid #ddd;">Фильтр (Сайдбар)</th>',
            '</tr>',
            '</thead>',
            '<tbody>'
        ]

        for section_name, _, _, fields_list in SECTION_MAP:
            # Заголовок Секции
            html.append(f'''
                <tr class="section-row">
                    <td colspan="5" style="background:#34495e; color:white; font-weight:bold; padding:8px 12px;">{section_name}</td>
                </tr>
            ''')

            for excel_name, db_name, is_sys_req in fields_list:
                # 1. REQUIRED (Обязательно)
                if is_sys_req:
                    req_input = f'''
                        <input type="checkbox" checked disabled>
                        <input type="hidden" name="custom_req" value="{db_name}">
                        <br><small style="color:red; font-weight:bold">SYSTEM</small>
                    '''
                else:
                    is_chk = "checked" if db_name in curr_req else ""
                    req_input = f'<input type="checkbox" name="custom_req" value="{db_name}" {is_chk} class="big-chk">'

                # 2. TEMPLATE (Excel)
                if is_sys_req:
                    vis_input = f'''
                        <input type="checkbox" checked disabled>
                        <input type="hidden" name="custom_vis" value="{db_name}">
                    '''
                else:
                    is_chk = "checked" if db_name in curr_vis else ""
                    vis_input = f'<input type="checkbox" name="custom_vis" value="{db_name}" {is_chk} class="big-chk">'

                # 3. PUBLIC (Таблица)
                if is_sys_req:
                    pub_input = f'''
                        <input type="checkbox" checked disabled>
                        <input type="hidden" name="custom_pub" value="{db_name}">
                    '''
                else:
                    is_chk = "checked" if db_name in curr_pub else ""
                    pub_input = f'<input type="checkbox" name="custom_pub" value="{db_name}" {is_chk} class="big-chk">'

                # 4. FILTERS (Фильтры) - НОВОЕ
                # Системные поля (Название, CAS) обычно ищут поиском, а не фильтром, но разрешим всё.
                is_chk = "checked" if db_name in curr_flt else ""
                flt_input = f'<input type="checkbox" name="custom_flt" value="{db_name}" {is_chk} class="big-chk">'

                # Отрисовка строки
                html.append(f'''
                <tr class="item-row" style="border-bottom:1px solid #eee;">
                    <td class="col-name" style="padding:8px; border-right:1px solid #eee;">
                        <div style="font-weight:500; font-size:13px;">{excel_name}</div>
                        <div style="font-size:10px; color:#999;">code: {db_name}</div>
                    </td>

                    <td class="col-check" style="background:#fff0f0; text-align:center; vertical-align:middle; border-right:1px solid #eee;">
                        {req_input}
                    </td>

                    <td class="col-check" style="background:#f0f8ff; text-align:center; vertical-align:middle; border-right:1px solid #eee;">
                        {vis_input}
                    </td>

                    <td class="col-check" style="background:#f0fff4; text-align:center; vertical-align:middle; border-right:1px solid #eee;">
                        {pub_input}
                    </td>

                    <td class="col-check" style="background:#fff9db; text-align:center; vertical-align:middle;">
                        {flt_input}
                    </td>
                </tr>
                ''')

        html.append('</tbody></table></div>')
        # Добавляем немного CSS прямо здесь для удобства
        html.append('''
            <style>
                .big-chk { transform: scale(1.5); cursor: pointer; }
                .matrix-table th, .matrix-table td { border-color: #e0e0e0; }
                .item-row:hover td { background-color: #f9f9f9 !important; }
            </style>
        ''')
        return mark_safe("".join(html))

# =========================================================
# 2. ФОРМА
# =========================================================
class RegistryConfigForm(forms.ModelForm):
    # Фиктивное поле для рендеринга виджета
    config_matrix = forms.CharField(required=False, label="")

    class Meta:
        model = RegistryConfig
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # 1. Извлекаем данные
        data = {
            'required': [],
            'template': [],
            'public': [],
            'filters': [] # <---
        }

        if self.instance and self.instance.pk:
            data['required'] = self.instance.required_fields or []
            data['template'] = self.instance.template_fields or []
            data['public'] = self.instance.public_list_fields or []
            # Проверяем атрибут, т.к. он новый и может не существовать в старых миграциях при первом запуске
            data['filters'] = getattr(self.instance, 'filter_fields', []) or []

        # 2. Инициализируем Виджет
        self.fields['config_matrix'].widget = MatrixConfigWidget(data_source=data)

    def save(self, commit=True):
        instance = super().save(commit=False)

        # 3. Сохранение данных из POST
        if self.data:
            r_list = self.data.getlist('custom_req')
            v_list = self.data.getlist('custom_vis')
            p_list = self.data.getlist('custom_pub')
            f_list = self.data.getlist('custom_flt') # <---

            # Страховка для системных полей
            for _, _, _, fields_list in SECTION_MAP:
                for _, db_name, is_sys in fields_list:
                    if is_sys:
                        if db_name not in r_list: r_list.append(db_name)
                        if db_name not in v_list: v_list.append(db_name)
                        if db_name not in p_list: p_list.append(db_name)

            instance.required_fields = r_list
            instance.template_fields = v_list
            instance.public_list_fields = p_list
            instance.filter_fields = f_list # <---

        if commit:
            instance.save()
        return instance

# =========================================================
# 3. АДМИНКА КОНФИГУРАЦИИ
# =========================================================
@admin.register(RegistryConfig)
class RegistryConfigAdmin(admin.ModelAdmin):
    form = RegistryConfigForm
    # Используем стандартный шаблон или кастомный, если он есть
    change_form_template = 'admin/registry/registryconfig/custom_change_form.html'
    save_on_top = True

    fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('config_matrix',)}),
    )

    def has_add_permission(self, request):
        # Singleton: запрещаем создавать, если уже есть запись
        return not RegistryConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

# =========================================================
# 4. АДМИНКА ЭЛЕМЕНТОВ (Стандартная)
# =========================================================
class AttachmentsInline(admin.TabularInline):
    model = ElementAttachment
    extra = 1
    verbose_name_plural = "📂 ДОКУМЕНТЫ"
    fields = ('file_preview', 'file', 'doc_type', 'description', 'uploaded_at')
    readonly_fields = ('file_preview', 'uploaded_at')
    def file_preview(self, obj): return format_html('<a href="{}" target="_blank">📄</a>', obj.file.url) if obj.file else "-"

def create_inline(model_class, title):
    class Inline(admin.StackedInline):
        model = model_class
        verbose_name_plural = title
        extra = 1; max_num = 1
    return Inline

@admin.register(ChemicalElement)
class ChemicalElementAdmin(SimpleHistoryAdmin):
    list_display = ('primary_name_ru', 'cas_number', 'status_badge', 'updated_at')
    search_fields = ('primary_name_ru', 'cas_number')
    list_filter = (
        'status',
        'created_at',
        'sec11_class__sanpin_class', # Фильтр по классу опасности
        'sec2_physical__appearance', # Фильтр по состоянию
    )
    save_on_top = True
    inlines = [create_inline(Sec1Identification, 'I. Идентификация'), AttachmentsInline]

    from .models import Sec2Physical, Sec3ToxSanPin, Sec4ToxAir, Sec5ToxAcute, Sec6ToxRisks, Sec8EcoTox, Sec9Soil, Sec10Water, Sec11HazardClass, Sec12GHSClass, Sec13GHSLabel, Sec14Safety, Sec15Storage, Sec16Waste, Sec17Incidents, Sec18InternationalReg, Sec20Docs, Sec21Companies, Sec22Volumes, Sec23Extra

    section_models = [Sec2Physical, Sec3ToxSanPin, Sec4ToxAir, Sec5ToxAcute, Sec6ToxRisks, Sec8EcoTox, Sec9Soil, Sec10Water, Sec11HazardClass, Sec12GHSClass, Sec13GHSLabel, Sec14Safety, Sec15Storage, Sec16Waste, Sec17Incidents, Sec18InternationalReg, Sec20Docs, Sec21Companies, Sec22Volumes, Sec23Extra]
    for m in section_models:
        inlines.append(create_inline(m, m._meta.verbose_name))

    def save_model(self, request, obj, form, change):
        if not obj.pk and not obj.created_by_id: obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def status_badge(self, obj): return obj.get_status_display()