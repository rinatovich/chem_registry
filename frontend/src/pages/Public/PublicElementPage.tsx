import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    Box, Container, Paper, Tabs, Tab, Divider,
    Grid, Button, CircularProgress, Alert, Chip, Typography
} from '@mui/material';
import {
    ArrowBack, PictureAsPdf, Download, CheckCircle, Cancel, Description
} from '@mui/icons-material';
import { getElementById, downloadPassport } from '../../api/registry';

// === 1. СЛОВАРЬ ЗНАЧЕНИЙ (RU) ===
const DISPLAY_MAP: Record<string, string> = {
    'SOLID': 'Твердое вещество', 'LIQUID': 'Жидкость', 'GAS': 'Газ', 'VAPOR': 'Пар', 'AEROSOL': 'Аэрозоль',
    'NONE': 'Без запаха', 'SHARP': 'Резкий', 'SPECIFIC': 'Специфический', 'FRUIT': 'Фруктовый', 'OTHER': 'Другое',
};

const formatValue = (val: any) => {
    if (val === null || val === undefined || val === "") return "—";
    return DISPLAY_MAP[String(val)] || val;
};

// === 2. СТРОКА ДАННЫХ ===
const InfoRow = ({ label, value, isBool = false }: { label: string, value?: any, isBool?: boolean }) => {
    return (
        <Box sx={{ mb: 2.5 }}>
            <Typography variant="overline" display="block" sx={{ color: '#64748b', lineHeight: 1.5, fontWeight: 700, fontSize: '11px' }}>
                {label}
            </Typography>

            <Box sx={{ mt: 0 }}>
                {isBool ? (
                    value ?
                        <Chip icon={<CheckCircle />} label="Да" color="success" size="small" variant="outlined" sx={{ fontWeight:600, border:'1px solid transparent', bgcolor:'#e6fffa', color: '#059669' }} /> :
                        <Chip icon={<Cancel />} label="Нет" size="small" variant="outlined" sx={{ border:'1px solid #e2e8f0', color: '#94a3b8', bgcolor:'#f8fafc' }} />
                ) : (
                    <Typography sx={{ fontSize: '15px', color: '#1e293b', fontWeight: 500, lineHeight: 1.4, whiteSpace:'pre-line' }}>
                        {formatValue(value)}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

// === 3. ЗАГОЛОВОК СЕКЦИИ ===
const SectionHeader = ({ title }: { title: string }) => (
    <Box sx={{ mt: 4, mb: 3, display: 'flex', alignItems: 'center', pb: 1, borderBottom: '2px solid #e2e8f0' }}>
        <Box sx={{ width: 4, height: 20, bgcolor: '#2563eb', mr: 1.5, borderRadius: 4 }}></Box>
        <Typography sx={{ fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: 0.5 }}>
            {title}
        </Typography>
    </Box>
);

// Компонент Панели Табов
function TabPanel({ children, value, index }: { children?: React.ReactNode; index: number; value: number; }) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <Box sx={{ p: { xs: 2, md: 4 }, minHeight: 500 }}>{children}</Box>}
        </div>
    );
}

// === СТРАНИЦА ===
const PublicElementPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);

    const { data, isLoading, error } = useQuery({
        queryKey: ['public-element', id],
        queryFn: () => getElementById(id!),
        enabled: !!id
    });

    if (isLoading) return <Box sx={{ display:'flex', justifyContent:'center', height:'100vh', alignItems:'center' }}><CircularProgress /></Box>;
    if (error) return <Box p={5}><Alert severity="error">Данные недоступны.</Alert></Box>;

    // Алиасы
    const s1 = data.sec1_identification || {};
    const s2 = data.sec2_physical || {};
    const s3 = data.sec3_sanpin || {};
    const s4 = data.sec4_air || {};
    const s5 = data.sec5_acute || {};
    const s6 = data.sec6_risks || {};
    const s8 = data.sec8_ecotox || {};
    const s9 = data.sec9_soil || {};
    const s10 = data.sec10_water || {};
    const s11 = data.sec11_class || {};
    const s13 = data.sec13_label || {};
    const s14 = data.sec14_safety || {};
    const s15 = data.sec15_storage || {};
    const s17 = data.sec17_incidents || {};
    const s18 = data.sec18_intl || {};
    const s20 = data.sec20_docs || {};
    const s21 = data.sec21_companies || {};
    const s22 = data.sec22_volumes || {};
    const s23 = data.sec23_extra || {};

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', pb: 8 }}>

            {/* HEADER */}
            <Paper elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #e2e8f0', pt: 2, pb: 3, mb: 4 }}>
                <Container maxWidth="xl">
                    <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ mb: 1.5, color: '#64748b', fontWeight: 500 }}>
                        К результатам
                    </Button>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, lineHeight: 1.1 }}>
                                {data.primary_name_ru}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap:'wrap' }}>
                                <Chip label="PUBLISHED" color="success" size="small" sx={{ fontWeight: 800, borderRadius: 1 }} />
                                <Divider orientation="vertical" flexItem sx={{ bgcolor:'#cbd5e1' }}/>
                                <Typography variant="body2" sx={{ color:'#64748b', fontSize:'13px' }}>
                                    ID: {data.id} • Обновлено: {new Date(data.updated_at).toLocaleDateString()}
                                </Typography>
                                {data.cas_number && <Chip label={`CAS: ${data.cas_number}`} size="small" variant="outlined" sx={{ color: '#475569', borderColor: '#cbd5e1' }}/>}
                            </Box>
                        </Box>

                        <Button
                            variant="contained" color="error" startIcon={<PictureAsPdf />}
                            onClick={() => downloadPassport(data.id, `Passport_${data.id}.pdf`)}
                            sx={{ boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)', borderRadius: 2, px: 3 }}
                        >
                            Скачать Паспорт
                        </Button>
                    </Box>
                </Container>
            </Paper>

            {/* CONTENT BODY */}
            <Container maxWidth="xl"> {/* Фикс ширины до 1536px */}
                <Grid container spacing={4}>

                    {/* ОСНОВНОЙ БЛОК (ЛЕВО) */}
                    <Grid item xs={12} lg={9}>
                        <Paper sx={{ borderRadius: 3, overflow:'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
                            <Tabs
                                value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
                                sx={{ borderBottom: 1, borderColor: '#e2e8f0', '& .MuiTab-root': { fontWeight: 600, fontSize:'14px', minHeight: 50 } }}
                            >
                                <Tab label="1. Идентификация" />
                                <Tab label="2. Токсикология" />
                                <Tab label="3. Экология" />
                                <Tab label="4. Классификация" />
                                <Tab label="5. Безопасность" />
                                <Tab label="6. Дополнительно" />
                            </Tabs>

                            {/* TAB 1 */}
                            <TabPanel value={tab} index={0}>
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={6}>
                                        <SectionHeader title="Идентификация" />
                                        <InfoRow label="Название вещества" value={data.primary_name_ru} />
                                        <InfoRow label="CAS Номер" value={data.cas_number} />
                                        <InfoRow label="Синонимы" value={s1.synonyms} />
                                        <InfoRow label="Хим. Формула" value={s1.molecular_formula} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <SectionHeader title="Классификаторы" />
                                        <InfoRow label="EC Номер" value={s1.ec_number} />
                                        <InfoRow label="ТН ВЭД" value={s1.tnved_code} />
                                        <InfoRow label="IUPAC" value={s1.iupac_name_ru} />
                                    </Grid>
                                </Grid>

                                <SectionHeader title="Физико-химические свойства" />
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={4}>
                                        <InfoRow label="Агрегатное состояние" value={s2.appearance} />
                                        <InfoRow label="Внешний вид / Цвет" value={s2.color} />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <InfoRow label="Температура плавления" value={s2.melting_point} />
                                        <InfoRow label="Температура кипения" value={s2.boiling_point} />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <InfoRow label="Плотность" value={s2.density} />
                                        <InfoRow label="pH" value={s2.ph} />
                                        <InfoRow label="Растворимость (Вода)" value={s2.solubility_water} />
                                    </Grid>
                                </Grid>
                            </TabPanel>

                            {/* TAB 2 */}
                            <TabPanel value={tab} index={1}>
                                <SectionHeader title="Показатели опасности" />
                                <Grid container spacing={4}>
                                    <Grid item xs={6} md={3}><InfoRow label="Класс (СанПиН)" value={s3.hazard_class} /></Grid>
                                    <Grid item xs={6} md={3}><InfoRow label="КВИО" value={s3.kvio} /></Grid>
                                    <Grid item xs={6} md={3}><InfoRow label="ПДК Раб.зоны" value={s3.pdk_workzone} /></Grid>
                                    <Grid item xs={6} md={3}><InfoRow label="Агрегатное" value={s3.state_in_air} /></Grid>
                                </Grid>
                                <Grid container spacing={4} mt={1}>
                                    <Grid item xs={6} md={6}><InfoRow label="ЛД50 Желудок" value={s3.ld50_stomach} /></Grid>
                                    <Grid item xs={6} md={6}><InfoRow label="ЛК50 Воздух" value={s3.lc50_air} /></Grid>
                                </Grid>

                                <SectionHeader title="Воздействие на здоровье (СГС)" />
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={4}>
                                        <InfoRow label="Разъедание кожи" value={s6.skin_corr} />
                                        <InfoRow label="Повреждение глаз" value={s6.eye_dmg} />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <InfoRow label="Канцерогенность" value={s6.carcinogenicity} />
                                        <InfoRow label="Мутагенность" value={s6.mutagenicity} />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <InfoRow label="Репрод. токсичность" value={s6.repro_tox} />
                                        <InfoRow label="Острая токсичность" value={s5.inhalation_lc50_effect} />
                                    </Grid>
                                </Grid>
                            </TabPanel>

                            {/* TAB 3 */}
                            <TabPanel value={tab} index={2}>
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={6}>
                                        <SectionHeader title="Экотоксикология" />
                                        <InfoRow label="ЛД50 Млекопитающие" value={s8.ld50_mammals} />
                                        <InfoRow label="ЛД50 Рыбы" value={s8.ld50_fish} />
                                        <InfoRow label="Биоаккумуляция" value={s8.bioaccumulation} isBool />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <SectionHeader title="Среда обитания" />
                                        <InfoRow label="ПДК в Почве" value={s9.pdk_soil} />
                                        <InfoRow label="Персистентность" value={s9.persistence} />
                                        <InfoRow label="Миграция" value={s9.migration} />
                                    </Grid>
                                </Grid>
                            </TabPanel>

                            {/* TAB 4 */}
                            <TabPanel value={tab} index={3}>
                                <SectionHeader title="Классы опасности (Стандарты)" />
                                <Grid container spacing={4} sx={{ bgcolor:'#f8fafc', p:2, borderRadius:2, mb:4 }}>
                                    <Grid item xs={4}><InfoRow label="СанПиН 0294-11" value={s11.sanpin_class} /></Grid>
                                    <Grid item xs={4}><InfoRow label="ГОСТ 12.1.007" value={s11.gost_body_class} /></Grid>
                                    <Grid item xs={4}><InfoRow label="ГОСТ 32424" value={s11.gost_env_class} /></Grid>
                                </Grid>

                                <SectionHeader title="Маркировка GHS (СГС)" />
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={5}>
                                        <InfoRow label="Сигнальное слово" value={s13.signal_word} />
                                        <InfoRow label="Пиктограммы" value={s13.pictogram_code} />
                                    </Grid>
                                    <Grid item xs={12} md={7}>
                                        <InfoRow label="H-фразы (Характеристика опасности)" value={s13.h_phrases} />
                                        <InfoRow label="P-фразы (Меры предосторожности)" value={s13.p_phrases} />
                                    </Grid>
                                </Grid>
                            </TabPanel>

                            {/* TAB 5 */}
                            <TabPanel value={tab} index={4}>
                                <SectionHeader title="Защита и Помощь" />
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={6}><InfoRow label="СИЗ (Средства защиты)" value={s14.prevent_health} /></Grid>
                                    <Grid item xs={12} md={6}><InfoRow label="Первая помощь" value={s14.first_aid} /></Grid>
                                </Grid>
                                <SectionHeader title="Складское хранение" />
                                <Grid container spacing={4}>
                                    <Grid item xs={6}><InfoRow label="Температурный режим" value={s15.temp_conditions} /></Grid>
                                    <Grid item xs={6}><InfoRow label="Срок хранения" value={s15.shelf_life} /></Grid>
                                </Grid>
                                <Box mt={2}><InfoRow label="Несовместимость / Требования" value={`${s15.incompatible || ''} \n ${s15.storage_reqs || ''}`} /></Box>
                            </TabPanel>

                            {/* TAB 6 */}
                            <TabPanel value={tab} index={5}>
                                <SectionHeader title="Международные соглашения" />
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                                    <InfoRow label="Озоноразрушающее" value={s18.ozone_destroying} isBool />
                                    <InfoRow label="Стокгольм (СОЗ)" value={s18.pops} isBool />
                                    <InfoRow label="Роттердам" value={s18.pic} isBool />
                                    <InfoRow label="Минамата" value={s18.mercury} isBool />
                                </Box>

                                <SectionHeader title="Статистика оборота" />
                                {/* Исправлен баг с undefined: теперь если нет данных, будет прочерк */}
                                <InfoRow label="Объем производства / Импорта" value={`${s22.vol_production || '—'} / ${s22.vol_import || '—'}`} />
                                <InfoRow label="Участники (Компании)" value={s21.info} />
                                <InfoRow label="Нормативная документация" value={s20.gost_standards} />
                            </TabPanel>
                        </Paper>
                    </Grid>

                    {/* ПРАВАЯ КОЛОНКА (САЙДБАР - ФАЙЛЫ) */}
                    <Grid item xs={12} lg={3}>
                        <Box sx={{ position: 'sticky', top: 24 }}>
                            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
                                <Typography variant="subtitle2" color="text.secondary" fontWeight="700" mb={2}>
                                    ПРИКРЕПЛЕННЫЕ ДОКУМЕНТЫ
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                {!data.attachments?.length ? (
                                    <Box sx={{ textAlign:'center', color:'#94a3b8', py:2 }}>
                                        <Description sx={{ fontSize:40, opacity:0.3 }} />
                                        <Typography variant="caption" display="block">Файлы отсутствуют</Typography>
                                    </Box>
                                ) : (
                                    data.attachments.map((file: any) => (
                                        <Button
                                            key={file.id} href={file.file} target="_blank"
                                            fullWidth variant="outlined" color="inherit"
                                            startIcon={<Download fontSize="small"/>}
                                            sx={{ mb: 1, justifyContent:'flex-start', textTransform:'none', borderColor: '#e2e8f0', color:'#475569' }}
                                        >
                                    <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                                        {file.description || "Документ PDF"}
                                    </span>
                                        </Button>
                                    ))
                                )}
                            </Paper>

                            <Alert severity="info" sx={{ borderRadius: 2, bgcolor:'#f0f9ff', color:'#0c4a6e' }}>
                                Информация предоставлена декларантом. Реестр не несет ответственности за достоверность.
                            </Alert>
                        </Box>
                    </Grid>

                </Grid>
            </Container>
        </Box>
    );
};

export default PublicElementPage;