from rest_framework import serializers
from .models import *

# ========================================================
# 1. СЕРИАЛАЙЗЕР ДЛЯ ФАЙЛОВ
# ========================================================

class Sec1Serializer(serializers.ModelSerializer):
    class Meta:
        model = Sec1Identification
        fields = '__all__'
        extra_kwargs = {
            'element': {'read_only': True},
            'structure_image': {'read_only': True}  # <--- ВОТ ЭТО ИСПРАВЛЯЕТ ОШИБКУ 400
        }

class ElementAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ElementAttachment
        fields = ['id', 'file', 'description', 'doc_type', 'uploaded_at']

# ========================================================
# 2. СЕРИАЛАЙЗЕРЫ СЕКЦИЙ (Фабрика классов)
# ========================================================
def create_sec_serializer(model_class):
    exclude_fields = ['element', 'id']
    try:
        model_class._meta.get_field('history')
        exclude_fields.append('history')
    except:
        pass

    class Meta:
        model = model_class
        exclude = tuple(exclude_fields)

    return type(f"{model_class.__name__}Serializer", (serializers.ModelSerializer,), {'Meta': Meta})

try:
    # Sec1Serializer = create_sec_serializer(Sec1Identification) <--- ЭТУ СТРОКУ УДАЛИТЬ ИЛИ ЗАКОММЕНТИРОВАТЬ
    Sec2Serializer = create_sec_serializer(Sec2Physical)
    Sec3Serializer = create_sec_serializer(Sec3ToxSanPin)
    Sec4Serializer = create_sec_serializer(Sec4ToxAir)
    Sec5Serializer = create_sec_serializer(Sec5ToxAcute)
    Sec6Serializer = create_sec_serializer(Sec6ToxRisks)
    Sec8Serializer = create_sec_serializer(Sec8EcoTox)
    Sec9Serializer = create_sec_serializer(Sec9Soil)
    Sec10Serializer = create_sec_serializer(Sec10Water)
    Sec11Serializer = create_sec_serializer(Sec11HazardClass)
    Sec12Serializer = create_sec_serializer(Sec12GHSClass)
    Sec13Serializer = create_sec_serializer(Sec13GHSLabel)
    Sec14Serializer = create_sec_serializer(Sec14Safety)
    Sec15Serializer = create_sec_serializer(Sec15Storage)
    Sec16Serializer = create_sec_serializer(Sec16Waste)
    Sec17Serializer = create_sec_serializer(Sec17Incidents)
    Sec18Serializer = create_sec_serializer(Sec18InternationalReg)
    Sec20Serializer = create_sec_serializer(Sec20Docs)
    Sec21Serializer = create_sec_serializer(Sec21Companies)
    Sec22Serializer = create_sec_serializer(Sec22Volumes)
    Sec23Serializer = create_sec_serializer(Sec23Extra)
except NameError as e:
    print(f"CRITICAL ERROR in serializers.py: {e}")

# ========================================================
# 3. СПИСОК (List View)
# ========================================================
class ChemicalElementListSerializer(serializers.ModelSerializer):
    hazard_class = serializers.CharField(source='sec11_class.get_sanpin_class_display', read_only=True)
    author_name = serializers.SerializerMethodField()

    def get_author_name(self, obj):
        if not obj.created_by:
            return "Система"
        if hasattr(obj.created_by, 'company_profile'):
             return obj.created_by.company_profile.company_name
        return obj.created_by.username

    class Meta:
        model = ChemicalElement
        fields = ('id', 'cas_number', 'primary_name_ru', 'status', 'updated_at', 'hazard_class', 'author_name')

# ========================================================
# 4. ДЕТАЛИ (Create/Update View)
# ========================================================
class ChemicalElementDetailSerializer(serializers.ModelSerializer):
    sec1_identification = Sec1Serializer(required=False)
    sec2_physical = Sec2Serializer(required=False)
    sec3_sanpin = Sec3Serializer(required=False)
    sec4_air = Sec4Serializer(required=False)
    sec5_acute = Sec5Serializer(required=False)
    sec6_risks = Sec6Serializer(required=False)
    sec8_ecotox = Sec8Serializer(required=False)
    sec9_soil = Sec9Serializer(required=False)
    sec10_water = Sec10Serializer(required=False)
    sec11_class = Sec11Serializer(required=False)
    sec12_ghs = Sec12Serializer(required=False)
    sec13_label = Sec13Serializer(required=False)
    sec14_safety = Sec14Serializer(required=False)
    sec15_storage = Sec15Serializer(required=False)
    sec16_waste = Sec16Serializer(required=False)
    sec17_incidents = Sec17Serializer(required=False)
    sec18_intl = Sec18Serializer(required=False)
    sec20_docs = Sec20Serializer(required=False)
    sec21_companies = Sec21Serializer(required=False)
    sec22_volumes = Sec22Serializer(required=False)
    sec23_extra = Sec23Serializer(required=False)

    attachments = ElementAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = ChemicalElement
        fields = '__all__'
        # УБРАЛИ 'status' отсюда! Теперь он контролируется в __init__
        read_only_fields = ('created_by', 'updated_at')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')

        # По умолчанию поле статуса доступно только для чтения
        self.fields['status'].read_only = True

        # Если это админ или персонал -> открываем поле для записи
        if request and (request.user.is_staff or getattr(request.user, 'role', '') in ['ADMIN', 'CONTROLLER']):
             self.fields['status'].read_only = False

    def create(self, validated_data):
        sections_data = self._extract_section_data(validated_data)
        element = ChemicalElement.objects.create(**validated_data)
        self._update_sections(element, sections_data)
        self._ensure_sections_exist(element)
        return element

    def update(self, instance, validated_data):
        sections_data = self._extract_section_data(validated_data)
        super().update(instance, validated_data)
        self._update_sections(instance, sections_data)
        return instance

    def _extract_section_data(self, data):
        sections = {}
        for key in list(data.keys()):
            if key.startswith('sec'):
                sections[key] = data.pop(key)
        return sections

    def _update_sections(self, element, sections_data):
        for field_name, data in sections_data.items():
            if not data: continue
            field = getattr(ChemicalElement, field_name)
            RelatedModel = field.related.related_model
            RelatedModel.objects.update_or_create(element=element, defaults=data)

    def _ensure_sections_exist(self, element):
        for rel in element._meta.related_objects:
            if rel.one_to_one and rel.name.startswith('sec'):
                if not hasattr(element, rel.name):
                    rel.related_model.objects.create(element=element)