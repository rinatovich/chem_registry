from django.contrib import admin
from django import forms
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from simple_history.admin import SimpleHistoryAdmin
from .models import *
from .structures import SECTION_MAP

# =========================================================
# 1. ЕДИНЫЙ ВИДЖЕТ (С НАДЕЖНОЙ ПАМЯТЬЮ)
# =========================================================
class MatrixConfigWidget(forms.Widget):
    # Инициализация: принимаем данные и сохраняем в 'self'
    def __init__(self, attrs=None, data_source=None):
        super().__init__(attrs)
        self.data_source = data_source or {}

    def render(self, name, value, attrs=None, renderer=None):
        # Извлекаем списки выбранных полей из переданного источника
        # Если данных нет, берем пустые списки
        curr_req = self.data_source.get('required', []) or []
        curr_vis = self.data_source.get('template', []) or []
        curr_pub = self.data_source.get('public', []) or []

        html = [
            '<div class="matrix-wrapper">',
            '<table class="matrix-table">',
            '<thead>',
            '<tr>',
                '<th class="th-name" style="text-align:left; width:40%; padding:12px; color:white;">Параметр / Поле</th>',
                '<th class="th-check col-req" style="width:20%; background:#ffe6e6; color:black;">Строго Обязательно</th>',
                '<th class="th-check col-xls" style="width:20%; background:#e6f2ff; color:black;">В Excel Шаблоне</th>',
                '<th class="th-check col-pub" style="width:20%; background:#e6fffa; color:black;">Публичная Таблица</th>',
            '</tr>',
            '</thead>',
            '<tbody>'
        ]

        for section_name, _, _, fields_list in SECTION_MAP:
            # Заголовок Секции
            html.append(f'''
                <tr class="section-row">
                    <td colspan="4" style="background:#34495e; color:white; font-weight:bold; padding:8px 12px;">{section_name}</td>
                </tr>
            ''')

            for excel_name, db_name, is_sys_req in fields_list:
                # --- ЛОГИКА REQUIRED ---
                # Если системное (напр Название) - всегда выбрано и заблокировано
                if is_sys_req:
                    req_input = f'''
                        <input type="checkbox" checked disabled class="sys-chk">
                        <input type="hidden" name="custom_req" value="{db_name}">
                        <br><small style="color:red; font-weight:bold">SYSTEM</small>
                    '''
                else:
                    # Иначе проверяем в списке
                    is_chk = "checked" if db_name in curr_req else ""
                    req_input = f'<input type="checkbox" name="custom_req" value="{db_name}" {is_chk} class="big-chk">'

                # --- ЛОГИКА EXCEL (TEMPLATE) ---
                if is_sys_req:
                    vis_input = f'''
                        <input type="checkbox" checked disabled class="sys-chk">
                        <input type="hidden" name="custom_vis" value="{db_name}">
                    '''
                else:
                    is_chk = "checked" if db_name in curr_vis else ""
                    vis_input = f'<input type="checkbox" name="custom_vis" value="{db_name}" {is_chk} class="big-chk">'

                # --- ЛОГИКА PUBLIC ---
                if is_sys_req:
                    pub_input = f'''
                        <input type="checkbox" checked disabled class="sys-chk">
                        <input type="hidden" name="custom_pub" value="{db_name}">
                    '''
                else:
                    is_chk = "checked" if db_name in curr_pub else ""
                    pub_input = f'<input type="checkbox" name="custom_pub" value="{db_name}" {is_chk} class="big-chk">'

                # Отрисовка строки
                html.append(f'''
                <tr class="item-row" style="border-bottom:1px solid #eee;">
                    <td class="col-name" style="padding:8px;">
                        <div style="font-weight:500; font-size:13px;">{excel_name}</div>
                        <div style="font-size:10px; color:#999;">code: {db_name}</div>
                    </td>

                    <td class="col-check" style="background:#fff0f0; text-align:center; vertical-align:middle;">
                        {req_input}
                    </td>

                    <td class="col-check" style="background:#f0f8ff; text-align:center; vertical-align:middle;">
                        {vis_input}
                    </td>

                    <td class="col-check" style="background:#f0fff4; text-align:center; vertical-align:middle;">
                        {pub_input}
                    </td>
                </tr>
                ''')

        html.append('</tbody></table></div>')
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

        # 1. Извлекаем данные из сохраненного объекта (если он есть)
        data = {
            'required': [],
            'template': [],
            'public': []
        }

        if self.instance and self.instance.pk:
            # Важно: проверяем на None, так как поле может быть пустым
            data['required'] = self.instance.required_fields or []
            data['template'] = self.instance.template_fields or []
            data['public'] = self.instance.public_list_fields or []

        # 2. Инициализируем Виджет, передавая ему словарь данных
        self.fields['config_matrix'].widget = MatrixConfigWidget(
            data_source=data
        )

    def save(self, commit=True):
        instance = super().save(commit=False)

        # 3. Сохранение: "Ловим" данные напрямую из POST запроса
        # self.data - это QueryDict (сырые данные формы)
        if self.data:
            r_list = self.data.getlist('custom_req')
            v_list = self.data.getlist('custom_vis')
            p_list = self.data.getlist('custom_pub')

            # Страховка: Добавляем системные поля, если они вдруг потерялись
            for _, _, _, fields_list in SECTION_MAP:
                for _, db_name, is_sys in fields_list:
                    if is_sys:
                        if db_name not in r_list: r_list.append(db_name)
                        if db_name not in v_list: v_list.append(db_name)
                        if db_name not in p_list: p_list.append(db_name)

            # Присваиваем JSON полям
            instance.required_fields = r_list
            instance.template_fields = v_list
            instance.public_list_fields = p_list

        if commit:
            instance.save()
        return instance

# =========================================================
# 3. АДМИНКА
# =========================================================
@admin.register(RegistryConfig)
class RegistryConfigAdmin(admin.ModelAdmin):
    form = RegistryConfigForm
    change_form_template = 'admin/registry/registryconfig/custom_change_form.html'
    save_on_top = True

    # Показываем только наше поле-матрицу, скрываем стандартные JSON поля
    fieldsets = (
        (None, {'classes': ('wide',), 'fields': ('config_matrix',)}),
    )

    def has_add_permission(self, request): return not RegistryConfig.objects.exists()
    def has_delete_permission(self, request, obj=None): return False

# -----------------------------------------------------------------
# Далее стандартный код для Элементов (Без изменений, но должен быть)
# -----------------------------------------------------------------
class AttachmentsInline(admin.TabularInline):
    model = ElementAttachment
    extra = 1
    verbose_name_plural = "📂 ДОКУМЕНТЫ"
    classes = ('show',)
    fields = ('file_preview', 'file', 'doc_type', 'description', 'uploaded_at')
    readonly_fields = ('file_preview', 'uploaded_at')
    def file_preview(self, obj): return format_html('<a href="{}" target="_blank">📄</a>', obj.file.url) if obj.file else "-"

def create_inline(model_class, title):
    class Inline(admin.StackedInline):
        model = model_class
        verbose_name_plural = title
        extra = 1; max_num = 1; classes = ()
    return Inline

@admin.register(ChemicalElement)
class ChemicalElementAdmin(SimpleHistoryAdmin):
    list_display = ('primary_name_ru', 'cas_number', 'status_badge', 'updated_at')
    search_fields = ('primary_name_ru', 'cas_number')
    list_filter = ('status',)
    save_on_top = True
    inlines = [create_inline(Sec1Identification, 'I. Идентификация'), AttachmentsInline]

    # Авто-сборка остальных инлайнов из моделей
    # (Здесь можно просто перечислить или импортировать models и пройти циклом,
    #  главное чтобы переменные моделей были доступны)
    from .models import Sec2Physical, Sec3ToxSanPin, Sec4ToxAir, Sec5ToxAcute, Sec6ToxRisks, Sec8EcoTox, Sec9Soil, Sec10Water, Sec11HazardClass, Sec12GHSClass, Sec13GHSLabel, Sec14Safety, Sec15Storage, Sec16Waste, Sec17Incidents, Sec18InternationalReg, Sec20Docs, Sec21Companies, Sec22Volumes, Sec23Extra

    # Добавляем все секции
    section_models = [Sec2Physical, Sec3ToxSanPin, Sec4ToxAir, Sec5ToxAcute, Sec6ToxRisks, Sec8EcoTox, Sec9Soil, Sec10Water, Sec11HazardClass, Sec12GHSClass, Sec13GHSLabel, Sec14Safety, Sec15Storage, Sec16Waste, Sec17Incidents, Sec18InternationalReg, Sec20Docs, Sec21Companies, Sec22Volumes, Sec23Extra]
    for m in section_models:
        inlines.append(create_inline(m, m._meta.verbose_name))

    def save_model(self, request, obj, form, change):
        if not obj.pk and not obj.created_by_id: obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def status_badge(self, obj): return obj.get_status_display()