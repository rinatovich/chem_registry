import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import {
    Box, Button, Paper, Tabs, Tab, TextField, Grid,
    Typography, LinearProgress, MenuItem, Alert
} from '@mui/material';
import { Save, ArrowBack, PictureAsPdf, AddCircle } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getElementById, updateElement, createElement, downloadPassport } from '../../api/registry';

// Начальные значения для "Создания" (Пустой бланк)
const INITIAL_VALUES = {
    primary_name_ru: '',
    cas_number: '',
    // Секции (важно создать пустые объекты, чтобы formik не ругался на undefined)
    sec1_identification: { synonyms: '', molecular_formula: '', ec_number: '', iupac_name_ru: '', structural_formula: '' },
    sec2_physical: { appearance: '', color: '', odor: '', ph: '', density: '' },
    // Остальные можно добавлять по мере расширения формы
};

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const ElementPage = () => {
    const { id } = useParams();
    const isCreateMode = id === 'new'; // Определяем режим

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    const [tabValue, setTabValue] = useState(0);

    // 1. ЗАГРУЗКА (Только если редактируем)
    const { data, isLoading, error } = useQuery({
        queryKey: ['element', id],
        queryFn: () => getElementById(id!),
        enabled: !isCreateMode // Не грузим, если new
    });

    // 2. МУТАЦИЯ (Умная: или создание, или обновление)
    const mutation = useMutation({
        mutationFn: (values: any) => {
            return isCreateMode ? createElement(values) : updateElement(id!, values);
        },
        onSuccess: (newData) => {
            enqueueSnackbar(isCreateMode ? 'Вещество создано!' : 'Данные сохранены', { variant: 'success' });
            queryClient.invalidateQueries({ queryKey: ['my-elements'] }); // Обновить список

            if (isCreateMode) {
                // Если создали новое, переходим на его страницу редактирования
                navigate(`/dashboard/elements/${newData.id}`, { replace: true });
            } else {
                // Если обновляли - обновляем кэш карточки
                queryClient.invalidateQueries({ queryKey: ['element', id] });
            }
        },
        onError: (err: any) => {
            console.error(err);
            enqueueSnackbar('Ошибка сохранения. Проверьте поля.', { variant: 'error' });
        }
    });

    const formik = useFormik({
        // Если есть данные с сервера - берем их, если нет - пустую структуру
        initialValues: data || INITIAL_VALUES,
        enableReinitialize: true,
        onSubmit: (values) => {
            mutation.mutate(values);
        },
    });

    if (isLoading) return <LinearProgress />;
    if (error && !isCreateMode) return <Alert severity="error">Ошибка загрузки карточки</Alert>;

    // Название для заголовка
    const pageTitle = isCreateMode
        ? "Создание нового вещества"
        : (formik.values.primary_name_ru || "Без названия");

    return (
        <form onSubmit={formik.handleSubmit}>

            {/* HEADER */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center', flexWrap:'wrap', gap:2 }}>
                <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
                    <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard/elements')} color="inherit">
                        Отмена
                    </Button>
                    <Box>
                        <Typography variant="h5" fontWeight="bold" color={isCreateMode ? "primary" : "default"}>
                            {pageTitle}
                        </Typography>
                        {!isCreateMode && (
                            <Typography variant="caption" sx={{ bgcolor:'#eee', px:1, borderRadius:1 }}>
                                ID: {data.id} • Статус: {data.status}
                            </Typography>
                        )}
                    </Box>
                </Box>

                <Box sx={{ display:'flex', gap: 2 }}>
                    {/* Кнопку Паспорт показываем только если уже создано */}
                    {!isCreateMode && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<PictureAsPdf />}
                            onClick={() => downloadPassport(id!, `passport_${formik.values.cas_number}.pdf`)}
                        >
                            Паспорт
                        </Button>
                    )}

                    <Button
                        variant="contained"
                        startIcon={isCreateMode ? <AddCircle /> : <Save />}
                        type="submit"
                        disabled={mutation.isPending}
                        sx={{ px: 4 }}
                    >
                        {isCreateMode ? "Создать Карточку" : "Сохранить Изменения"}
                    </Button>
                </Box>
            </Box>

            {/* FORM BODY */}
            <Paper sx={{ width: '100%', borderRadius: 2 }}>
                <Tabs
                    value={tabValue}
                    onChange={(_, v) => setTabValue(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fafafa' }}
                >
                    <Tab label="1. Главная информация" />
                    <Tab label="2. Физические свойства" />
                    <Tab label="3. Токсикология (Скелет)" disabled />
                </Tabs>

                {/* TAB 1 */}
                <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth required
                                label="Название вещества (RU)"
                                name="primary_name_ru"
                                value={formik.values.primary_name_ru || ''}
                                onChange={formik.handleChange}
                                helperText="Основное торговое или химическое наименование"
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="CAS Номер"
                                name="cas_number"
                                placeholder="00-00-0"
                                value={formik.values.cas_number || ''}
                                onChange={formik.handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                                Раздел I. Идентификация
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Синонимы (через запятую)"
                                name="sec1_identification.synonyms"
                                value={formik.values.sec1_identification?.synonyms || ''}
                                onChange={formik.handleChange}
                                multiline
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Молекулярная формула"
                                name="sec1_identification.molecular_formula"
                                value={formik.values.sec1_identification?.molecular_formula || ''}
                                onChange={formik.handleChange}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="IUPAC Название (RU)"
                                name="sec1_identification.iupac_name_ru"
                                value={formik.values.sec1_identification?.iupac_name_ru || ''}
                                onChange={formik.handleChange}
                            />
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* TAB 2 */}
                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h6" gutterBottom>Раздел II. Физ-хим свойства</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Агрегатное состояние"
                                name="sec2_physical.appearance"
                                value={formik.values.sec2_physical?.appearance || ''}
                                onChange={formik.handleChange}
                            >
                                <MenuItem value="">Не выбрано</MenuItem>
                                <MenuItem value="SOLID">Твердое вещество</MenuItem>
                                <MenuItem value="LIQUID">Жидкость</MenuItem>
                                <MenuItem value="GAS">Газ</MenuItem>
                                <MenuItem value="VAPOR">Пар</MenuItem>
                                <MenuItem value="AEROSOL">Аэрозоль</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Внешний вид / Цвет"
                                name="sec2_physical.color"
                                value={formik.values.sec2_physical?.color || ''}
                                onChange={formik.handleChange}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="pH"
                                name="sec2_physical.ph"
                                value={formik.values.sec2_physical?.ph || ''}
                                onChange={formik.handleChange}
                            />
                        </Grid>
                    </Grid>
                </TabPanel>

            </Paper>
        </form>
    );
};

export default ElementPage;