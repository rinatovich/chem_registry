import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Box, Button, Paper, Tabs, Tab, TextField, Grid,
    Typography, LinearProgress, MenuItem, Alert, Snackbar,
    FormControlLabel, Switch, Chip, IconButton, List, ListItem,
    ListItemText, ListItemIcon
} from '@mui/material';
import {
    Save, ArrowBack, PictureAsPdf,
    CloudUpload, Delete, InsertDriveFile
} from '@mui/icons-material';
import {
    getElementById, updateElement, createElement, downloadPassport,
    uploadElementFile, deleteElementFile
} from '../../api/registry';
import { uploadStructureImage } from '../../api/registry';
import { FORM_OPTIONS } from '../../constants/formOptions';



// === 1. СПРАВОЧНИКИ (ВЫПАДАЮЩИЕ СПИСКИ) ===


// === 2. НАЧАЛЬНЫЕ ЗНАЧЕНИЯ ===
const INITIAL_VALUES = {
    primary_name_ru: '',
    cas_number: '',
    sec1_identification: { synonyms: '', molecular_formula: '', structural_formula: '', ec_number: '', iupac_name_ru: '', iupac_name_en: '', tnved_code: '' },
    sec2_physical: { appearance: '', odor: 'OTHER', color: '', ph: '', mol_mass: '', melting_point: '', boiling_point: '', auto_ignition: '', density: '', solubility_water: '' },
    sec3_sanpin: { state_in_air: '', pdk_workzone: '', ld50_stomach: '', ld50_skin: '', lc50_air: '', kvio: '', zone_acute: '', zone_chronic: '' },
    sec4_air: { limit_sign: '', pdk_max_single: '', pdk_daily_avg: '', pdk_month_avg: '', pdk_year_avg: '' },
    sec5_acute: { inhalation_lc50_effect: 'UNKNOWN', inhalation_lc50_val: '', dermal_ld50_effect: 'UNKNOWN', dermal_ld50_val: '', oral_ld50_effect: 'UNKNOWN', oral_ld50_val: '' },
    sec6_risks: { skin_corr: 'NC', eye_dmg: 'NC', sensitization: 'NC', mutagenicity: 'NC', carcinogenicity: 'NC', repro_tox: 'NC', aspiration_hazard: 'NC' },
    sec8_ecotox: { ld50_mammals: '', ld50_fish: '', ld50_bees: '', ld50_birds: '', bioaccumulation: false, phytotoxicity: false },
    sec9_soil: { pdk_soil: '', odk_soil: '', persistence: '', sorption: '', migration: '' },
    sec10_water: { acute_fish: '', acute_algae: '', chronic_fish: '', bioacc_logkow: '' },
    sec11_class: { sanpin_class: 'NC', gost_body_class: 'NC', gost_env_class: 'NC' },
    sec12_ghs: { phys_hazard: '', chem_hazard: '', env_hazard: '' },
    sec13_label: { signal_word: 'NONE', pictogram_code: '', h_phrases: '', p_phrases: '' },
    sec14_safety: { prevent_health: '', first_aid: '', prevent_env: '' },
    sec15_storage: { temp_conditions: '', humidity: '', shelf_life: '', storage_reqs: '', incompatible: '' },
    sec16_waste: { collection: '', transport: '', disposal: '', burial: '' },
    sec17_incidents: { accident_history: '' },
    sec18_intl: { ozone_destroying: false, pops: false, pic: false, mercury: false, basel: false },
    sec20_docs: { gost_standards: '', intl_docs: '' },
    sec21_companies: { info: '' },
    sec22_volumes: { vol_production: '', vol_import: '', vol_export: '' },
    sec23_extra: { recommendations: '' }
};

const VALIDATION_SCHEMA = Yup.object({
    primary_name_ru: Yup.string().required('Название вещества обязательно'),
});

// === UI КОМПОНЕНТЫ ===
const FormSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', color: 'primary.main', fontWeight: 700, mb: 2, letterSpacing: 0.5 }}>
            {title}
        </Typography>
        <Grid container spacing={3}>
            {children}
        </Grid>
    </Paper>
);

const Field = ({ children, xs = 12, md = 6, lg = 4 }: any) => (
    <Grid item xs={xs} md={md} lg={lg}>{children}</Grid>
);

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other} style={{ width: '100%' }}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

// === Вкладка файлов ===
const FilesTab = ({ elementId, attachments, onUpdate }: { elementId: string, attachments: any[], onUpdate: () => void }) => {
    const [file, setFile] = useState<File | null>(null);
    const [desc, setDesc] = useState('');
    const [type, setType] = useState('OTHER');
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            await uploadElementFile(elementId, file, desc, type);
            onUpdate();
            setFile(null);
            setDesc('');
            setType('OTHER');
        } catch (e) {
            console.error(e);
            alert('Ошибка загрузки файла');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (attId: number) => {
        if (!confirm("Удалить файл?")) return;
        try { await deleteElementFile(elementId, attId); onUpdate(); } catch (e) { console.error(e); }
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3, border: '1px dashed #2563eb', borderRadius: 2, bgcolor: '#f8fafc' }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Загрузить документ</Typography>
                    <Button variant="outlined" component="label" fullWidth startIcon={<CloudUpload />} sx={{ mb: 2, py: 1.5, borderStyle: 'dashed', bgcolor: 'white' }}>
                        {file ? file.name : "Выбрать файл..."}
                        <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </Button>
                    <TextField select fullWidth size="small" label="Тип документа" value={type} onChange={(e) => setType(e.target.value)} sx={{ mb: 2, bgcolor: 'white' }}>
                        <MenuItem value="PASSPORT">Паспорт безопасности (MSDS)</MenuItem>
                        <MenuItem value="CERTIFICATE">Сертификат соответствия</MenuItem>
                        <MenuItem value="LAB_PROTOCOL">Протокол испытаний</MenuItem>
                        <MenuItem value="OTHER">Другое</MenuItem>
                    </TextField>
                    <TextField fullWidth size="small" label="Описание" value={desc} onChange={(e) => setDesc(e.target.value)} sx={{ mb: 2, bgcolor: 'white' }} />
                    <Button variant="contained" fullWidth disabled={!file || uploading} onClick={handleUpload}>{uploading ? "Загрузка..." : "Сохранить файл"}</Button>
                </Paper>
            </Grid>
            <Grid item xs={12} md={7}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Файлы ({attachments.length})</Typography>
                {attachments.length === 0 ? <Alert severity="info">Нет файлов.</Alert> : (
                    <List sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                        {attachments.map((att) => (
                            <ListItem key={att.id} divider secondaryAction={<IconButton edge="end" color="error" onClick={() => handleDelete(att.id)}><Delete /></IconButton>}>
                                <ListItemIcon><InsertDriveFile color="primary" /></ListItemIcon>
                                <ListItemText primary={att.description || "Без названия"} secondary={`${att.doc_type} • ${new Date(att.uploaded_at).toLocaleDateString()}`} />
                                <Button size="small" href={att.file} target="_blank" sx={{ mr: 1 }}>Скачать</Button>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Grid>
        </Grid>
    );
};

// === ГЛАВНЫЙ КОМПОНЕНТ ===
const ElementPage = () => {
    const { id } = useParams();
    const isCreateMode = !id || id === 'new';
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [tabValue, setTabValue] = useState(0);
    const [msg, setMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['element', id],
        queryFn: () => getElementById(id!),
        enabled: !!id && !isCreateMode,
        staleTime: 0
    });

    const mutation = useMutation({
        mutationFn: (values: any) => isCreateMode ? createElement(values) : updateElement(id!, values),
        onSuccess: (newData) => {
            setMsg({ type: 'success', text: 'Данные успешно сохранены' });
            queryClient.invalidateQueries({ queryKey: ['my-elements'] });
            if (isCreateMode) navigate(`/dashboard/elements/${newData.id}`, { replace: true });
            else queryClient.invalidateQueries({ queryKey: ['element', id] });
        },
        // === ИСПРАВЛЕНИЕ ОШИБОК ===
        onError: (err: any) => {
            console.error("Error:", err);
            // Если пришли ошибки валидации полей (объект)
            if (err.response?.data && typeof err.response.data === 'object' && !Array.isArray(err.response.data)) {
                // Подсвечиваем поля красным в Formik
                formik.setErrors(err.response.data);

                // Формируем текст для уведомления
                const errList = Object.entries(err.response.data)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                    .join('\n');

                setMsg({ type: 'error', text: `Проверьте ошибки ввода:\n${errList}` });
            } else {
                setMsg({ type: 'error', text: err.response?.data?.detail || "Ошибка сервера" });
            }
        }
    });

    const formik = useFormik({
        initialValues: data || INITIAL_VALUES,
        enableReinitialize: true,
        validationSchema: VALIDATION_SCHEMA,
        onSubmit: (values) => {
            // === ВАЖНО: ОЧИСТКА ДАННЫХ ===
            // Клонируем, чтобы не менять стейт формы напрямую
            const payload = JSON.parse(JSON.stringify(values));

            // Если CAS пустой, отправляем null (чтобы не было конфликта unique)
            if (!payload.cas_number || payload.cas_number.trim() === '') {
                payload.cas_number = null;
            }
            mutation.mutate(payload);
        },
    });

    const handleStructureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && id) {
            try {
                await uploadStructureImage(id, e.target.files[0]);
                queryClient.invalidateQueries({ queryKey: ['element', id] });
                setMsg({ type: 'success', text: 'Структура обновлена' });
            } catch (err) {
                setMsg({ type: 'error', text: 'Ошибка загрузки изображения' });
            }
        }
    };

    if (isLoading) return <LinearProgress />;


    return (
        <form onSubmit={formik.handleSubmit}>
            <Snackbar open={!!msg} autoHideDuration={6000} onClose={() => setMsg(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={msg?.type} onClose={() => setMsg(null)} sx={{ width: '100%', whiteSpace: 'pre-line' }}>{msg?.text}</Alert>
            </Snackbar>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard/elements')} color="inherit">Назад</Button>
                    <Typography variant="h5" fontWeight="800" color="#1e293b">{isCreateMode ? "Создание вещества" : formik.values.primary_name_ru}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {!isCreateMode && <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={() => downloadPassport(id!)}>Паспорт</Button>}
                    <Button variant="contained" color="success" startIcon={<Save />} type="submit" disabled={mutation.isPending}>{isCreateMode ? "Создать" : "Сохранить"}</Button>
                </Box>
            </Box>

            <Paper elevation={0} sx={{ width: '100%', borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc', '& .MuiTab-root': { fontWeight: 600 } }}>
                    <Tab label="1. Идентификация" />
                    <Tab label="2. Физика" />
                    <Tab label="3. Токсикология" />
                    <Tab label="4. Экология и Почва" />
                    <Tab label="5. Классификация" />
                    <Tab label="6. Безопасность" />
                    <Tab label="7. Дополнительно" />
                    <Tab label="8. Документы" />
                </Tabs>

                <Box sx={{ px: 3, bgcolor: '#fff', minHeight: 500 }}>
                    {/* 1. ИДЕНТИФИКАЦИЯ */}
                    <TabPanel value={tabValue} index={0}>
                        <FormSection title="Основные сведения">
                            <Field md={8}>
                                <TextField fullWidth required label="Название вещества (RU)" name="primary_name_ru"
                                           value={formik.values.primary_name_ru} onChange={formik.handleChange}
                                           error={formik.touched.primary_name_ru && Boolean(formik.errors.primary_name_ru)}
                                           helperText={formik.touched.primary_name_ru && formik.errors.primary_name_ru}
                                />
                            </Field>
                            <Field md={4}>
                                <TextField fullWidth label="CAS Номер" name="cas_number"
                                           value={formik.values.cas_number || ''} onChange={formik.handleChange}
                                           error={Boolean(formik.errors.cas_number)}
                                           helperText={formik.errors.cas_number}
                                           placeholder="00-00-0"
                                />
                            </Field>
                            <Field xs={12}><TextField fullWidth multiline label="Синонимы" name="sec1_identification.synonyms" value={formik.values.sec1_identification?.synonyms || ''} onChange={formik.handleChange} /></Field>
                        </FormSection>
                        <FormSection title="Кодификаторы">
                            <Field><TextField fullWidth label="Хим. Формула" name="sec1_identification.molecular_formula" value={formik.values.sec1_identification?.molecular_formula || ''} onChange={formik.handleChange} /></Field>
                            <Field><TextField fullWidth label="EC Номер" name="sec1_identification.ec_number" value={formik.values.sec1_identification?.ec_number || ''} onChange={formik.handleChange} /></Field>
                            <Field><TextField fullWidth label="Код ТН ВЭД" name="sec1_identification.tnved_code" value={formik.values.sec1_identification?.tnved_code || ''} onChange={formik.handleChange} /></Field>
                        </FormSection>
                        {/* СЕКЦИЯ СТРУКТУРЫ */}
                        <FormSection title="Химическая структура">
                            <Grid item xs={12} display="flex" gap={4} alignItems="flex-start">
                                {/* Превью */}
                                <Box
                                    sx={{
                                        width: 200, height: 200,
                                        border: '2px dashed #e0e0e0', borderRadius: 2,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden', bgcolor: '#fafafa', position: 'relative'
                                    }}
                                >
                                    {data?.sec1_identification?.structure_image ? (
                                        <img
                                            src={data.sec1_identification.structure_image}
                                            alt="Structure"
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <Typography variant="caption" color="text.disabled">Нет изображения</Typography>
                                    )}
                                </Box>

                                {/* Кнопка */}
                                <Box>
                                    <Typography variant="body2" paragraph>
                                        Загрузите изображение структурной формулы (PNG, JPG).
                                    </Typography>
                                    {!isCreateMode ? (
                                        <Button variant="outlined" component="label" startIcon={<CloudUpload />}>
                                            Загрузить структуру
                                            <input type="file" hidden accept="image/*" onChange={handleStructureUpload} />
                                        </Button>
                                    ) : (
                                        <Alert severity="info" sx={{ py: 0 }}>Сначала создайте карточку</Alert>
                                    )}
                                </Box>
                            </Grid>
                        </FormSection>
                    </TabPanel>

                    {/* 2. ФИЗИКА */}
                    <TabPanel value={tabValue} index={1}>
                        <FormSection title="Свойства">
                            <Field>
                                <TextField select fullWidth label="Агрегатное состояние" name="sec2_physical.appearance" value={formik.values.sec2_physical?.appearance || ''} onChange={formik.handleChange}>
                                    {FORM_OPTIONS.appearance.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                </TextField>
                            </Field>
                            <Field>
                                <TextField select fullWidth label="Запах" name="sec2_physical.odor" value={formik.values.sec2_physical?.odor || 'OTHER'} onChange={formik.handleChange}>
                                    {FORM_OPTIONS.odor.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                </TextField>
                            </Field>
                            <Field><TextField fullWidth label="Цвет" name="sec2_physical.color" value={formik.values.sec2_physical?.color || ''} onChange={formik.handleChange} /></Field>
                            <Field md={3}><TextField fullWidth label="Т. плавления" name="sec2_physical.melting_point" value={formik.values.sec2_physical?.melting_point || ''} onChange={formik.handleChange} /></Field>
                            <Field md={3}><TextField fullWidth label="Т. кипения" name="sec2_physical.boiling_point" value={formik.values.sec2_physical?.boiling_point || ''} onChange={formik.handleChange} /></Field>
                            <Field md={3}><TextField fullWidth label="Плотность" name="sec2_physical.density" value={formik.values.sec2_physical?.density || ''} onChange={formik.handleChange} /></Field>
                            <Field md={3}><TextField fullWidth label="pH" name="sec2_physical.ph" value={formik.values.sec2_physical?.ph || ''} onChange={formik.handleChange} /></Field>
                        </FormSection>
                    </TabPanel>

                    {/* 3. ТОКСИКОЛОГИЯ */}
                    <TabPanel value={tabValue} index={2}>
                        <FormSection title="Параметры">
                            <Field>
                                <TextField select fullWidth label="Состояние в воздухе" name="sec3_sanpin.state_in_air" value={formik.values.sec3_sanpin?.state_in_air || ''} onChange={formik.handleChange}>
                                    {FORM_OPTIONS.state_in_air.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                </TextField>
                            </Field>
                            <Field><TextField fullWidth label="ПДК Раб.зоны" name="sec3_sanpin.pdk_workzone" value={formik.values.sec3_sanpin?.pdk_workzone || ''} onChange={formik.handleChange} /></Field>
                            <Field><TextField fullWidth label="КВИО" name="sec3_sanpin.kvio" value={formik.values.sec3_sanpin?.kvio || ''} onChange={formik.handleChange} /></Field>
                            <Field>
                                <TextField select fullWidth label="Лимитирующий признак" name="sec4_air.limit_sign" value={formik.values.sec4_air?.limit_sign || ''} onChange={formik.handleChange}>
                                    {FORM_OPTIONS.limit_sign.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                </TextField>
                            </Field>
                        </FormSection>
                        <FormSection title="Эффекты острой токсичности">
                            <Field>
                                <TextField select fullWidth label="Ингаляционно (Вдыхание)" name="sec5_acute.inhalation_lc50_effect" value={formik.values.sec5_acute?.inhalation_lc50_effect || 'UNKNOWN'} onChange={formik.handleChange}>
                                    {FORM_OPTIONS.yes_no_unknown.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                </TextField>
                            </Field>
                            <Field>
                                <TextField select fullWidth label="Дермально (Кожа)" name="sec5_acute.dermal_ld50_effect" value={formik.values.sec5_acute?.dermal_ld50_effect || 'UNKNOWN'} onChange={formik.handleChange}>
                                    {FORM_OPTIONS.yes_no_unknown.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                </TextField>
                            </Field>
                            <Field>
                                <TextField select fullWidth label="Перорально (Рот)" name="sec5_acute.oral_ld50_effect" value={formik.values.sec5_acute?.oral_ld50_effect || 'UNKNOWN'} onChange={formik.handleChange}>
                                    {FORM_OPTIONS.yes_no_unknown.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                </TextField>
                            </Field>
                        </FormSection>
                        <FormSection title="Специфические эффекты (СГС)">
                            <Field><TextField select fullWidth label="Канцерогенность" name="sec6_risks.carcinogenicity" value={formik.values.sec6_risks?.carcinogenicity || 'NC'} onChange={formik.handleChange}>{FORM_OPTIONS.ghs_category.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}</TextField></Field>
                            <Field><TextField select fullWidth label="Мутагенность" name="sec6_risks.mutagenicity" value={formik.values.sec6_risks?.mutagenicity || 'NC'} onChange={formik.handleChange}>{FORM_OPTIONS.ghs_category.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}</TextField></Field>
                            <Field><TextField select fullWidth label="Репродуктивная токс." name="sec6_risks.repro_tox" value={formik.values.sec6_risks?.repro_tox || 'NC'} onChange={formik.handleChange}>{FORM_OPTIONS.ghs_category.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}</TextField></Field>
                        </FormSection>
                    </TabPanel>

                    {/* 4. ЭКОЛОГИЯ И ПОЧВА */}
                    <TabPanel value={tabValue} index={3}>
                        <FormSection title="Экотоксичность">
                            <Field><TextField fullWidth label="LD50 Рыбы" name="sec8_ecotox.ld50_fish" value={formik.values.sec8_ecotox?.ld50_fish || ''} onChange={formik.handleChange} /></Field>
                            <Field>
                                <FormControlLabel control={<Switch checked={formik.values.sec8_ecotox?.bioaccumulation || false} onChange={formik.handleChange} name="sec8_ecotox.bioaccumulation" />} label="Биоаккумуляция" />
                                <FormControlLabel control={<Switch checked={formik.values.sec8_ecotox?.phytotoxicity || false} onChange={formik.handleChange} name="sec8_ecotox.phytotoxicity" />} label="Фитотоксичность" />
                            </Field>
                        </FormSection>
                        <FormSection title="Почва">
                            <Field>
                                <TextField select fullWidth label="Персистентность" name="sec9_soil.persistence" value={formik.values.sec9_soil?.persistence || ''} onChange={formik.handleChange}>
                                    {FORM_OPTIONS.persistence.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                </TextField>
                            </Field>
                            <Field>
                                <TextField select fullWidth label="Миграция" name="sec9_soil.migration" value={formik.values.sec9_soil?.migration || ''} onChange={formik.handleChange}>
                                    {FORM_OPTIONS.migration.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                </TextField>
                            </Field>
                            <Field>
                                <TextField select fullWidth label="Сорбция" name="sec9_soil.sorption" value={formik.values.sec9_soil?.sorption || ''} onChange={formik.handleChange}>
                                    {FORM_OPTIONS.sorption.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                </TextField>
                            </Field>
                        </FormSection>
                    </TabPanel>

                    {/* 5. КЛАССИФИКАЦИЯ */}
                    <TabPanel value={tabValue} index={4}>
                        <FormSection title="Классы опасности">
                            <Field>
                                <TextField select fullWidth label="Класс (СанПиН)" name="sec11_class.sanpin_class" value={formik.values.sec11_class?.sanpin_class || 'NC'} onChange={formik.handleChange}>
                                    {FORM_OPTIONS.sanpin_class.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                </TextField>
                            </Field>
                            <Field>
                                <TextField select fullWidth label="ГОСТ 12.1.007" name="sec11_class.gost_body_class" value={formik.values.sec11_class?.gost_body_class || 'NC'} onChange={formik.handleChange}>
                                    {FORM_OPTIONS.sanpin_class.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                </TextField>
                            </Field>
                        </FormSection>
                        <FormSection title="Маркировка СГС">
                            <Field md={3}>
                                <TextField select fullWidth label="Сигнальное слово" name="sec13_label.signal_word" value={formik.values.sec13_label?.signal_word || 'NONE'} onChange={formik.handleChange}>
                                    {FORM_OPTIONS.signal_word.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                </TextField>
                            </Field>
                            <Field md={9}><TextField fullWidth label="Пиктограммы (коды)" name="sec13_label.pictogram_code" value={formik.values.sec13_label?.pictogram_code || ''} onChange={formik.handleChange} /></Field>
                            <Field xs={12}><TextField fullWidth multiline rows={2} label="H-фразы (Опасности)" name="sec13_label.h_phrases" value={formik.values.sec13_label?.h_phrases || ''} onChange={formik.handleChange} /></Field>
                            <Field xs={12}><TextField fullWidth multiline rows={2} label="P-фразы (Меры)" name="sec13_label.p_phrases" value={formik.values.sec13_label?.p_phrases || ''} onChange={formik.handleChange} /></Field>
                        </FormSection>
                    </TabPanel>

                    {/* 6. БЕЗОПАСНОСТЬ */}
                    <TabPanel value={tabValue} index={5}>
                        <FormSection title="Меры помощи">
                            <Field xs={12}><TextField fullWidth multiline rows={3} label="Первая помощь" name="sec14_safety.first_aid" value={formik.values.sec14_safety?.first_aid || ''} onChange={formik.handleChange} /></Field>
                            <Field xs={12}><TextField fullWidth multiline rows={3} label="СИЗ (Защита)" name="sec14_safety.prevent_health" value={formik.values.sec14_safety?.prevent_health || ''} onChange={formik.handleChange} /></Field>
                        </FormSection>
                        <FormSection title="Хранение">
                            <Field><TextField fullWidth label="Условия хранения" name="sec15_storage.storage_reqs" value={formik.values.sec15_storage?.storage_reqs || ''} onChange={formik.handleChange} /></Field>
                            <Field><TextField fullWidth label="Несовместимость" name="sec15_storage.incompatible" value={formik.values.sec15_storage?.incompatible || ''} onChange={formik.handleChange} /></Field>
                            <Field><TextField fullWidth label="Утилизация" name="sec16_waste.disposal" value={formik.values.sec16_waste?.disposal || ''} onChange={formik.handleChange} /></Field>
                        </FormSection>
                    </TabPanel>

                    {/* 7. ДОПОЛНИТЕЛЬНО */}
                    <TabPanel value={tabValue} index={6}>
                        <FormSection title="Конвенции">
                            <Grid item xs={12}>
                                <FormControlLabel control={<Switch checked={formik.values.sec18_intl?.ozone_destroying || false} onChange={formik.handleChange} name="sec18_intl.ozone_destroying" />} label="Монреаль (Озоноразрушающие)" />
                                <FormControlLabel control={<Switch checked={formik.values.sec18_intl?.pops || false} onChange={formik.handleChange} name="sec18_intl.pops" />} label="Стокгольм (СОЗ)" />
                                <FormControlLabel control={<Switch checked={formik.values.sec18_intl?.pic || false} onChange={formik.handleChange} name="sec18_intl.pic" />} label="Роттердам" />
                                <FormControlLabel control={<Switch checked={formik.values.sec18_intl?.mercury || false} onChange={formik.handleChange} name="sec18_intl.mercury" />} label="Минамата (Ртуть)" />
                            </Grid>
                        </FormSection>
                        <FormSection title="Инфо">
                            <Field><TextField fullWidth label="Объем производства" name="sec22_volumes.vol_production" value={formik.values.sec22_volumes?.vol_production || ''} onChange={formik.handleChange} /></Field>
                            <Field xs={12}><TextField fullWidth multiline label="Участники цепи поставок" name="sec21_companies.info" value={formik.values.sec21_companies?.info || ''} onChange={formik.handleChange} /></Field>
                        </FormSection>
                    </TabPanel>

                    {/* 8. ДОКУМЕНТЫ */}
                    <TabPanel value={tabValue} index={7}>
                        {isCreateMode ? <Alert severity="info" variant="outlined">Сохраните карточку перед загрузкой файлов.</Alert> : <FilesTab elementId={id!} attachments={data?.attachments || []} onUpdate={() => queryClient.invalidateQueries({ queryKey: ['element', id] })} />}
                    </TabPanel>

                </Box>
            </Paper>
        </form>
    );
};

export default ElementPage;