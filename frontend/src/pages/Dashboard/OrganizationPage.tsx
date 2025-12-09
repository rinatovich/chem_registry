import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box, Typography, Paper, Grid, TextField, Button, LinearProgress, Divider,
    Avatar, IconButton, Badge
} from '@mui/material';
import { Save, Business, PhotoCamera } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getProfile, updateProfile } from '../../api/auth';

const OrganizationPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();

    // Храним выбранный файл локально перед отправкой для превью
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // 1. ЗАГРУЗКА ДАННЫХ ПРОФИЛЯ
    const { data, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
    });

    // 2. СОХРАНЕНИЕ (МУТАЦИЯ)
    const mutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            enqueueSnackbar('Информация об организации обновлена', { variant: 'success' });
            queryClient.invalidateQueries({ queryKey: ['profile'] }); // Обновить данные в хедере
            setLogoFile(null); // Сбросить файл после успешной загрузки
        },
        onError: (err: any) => {
            console.error(err);
            enqueueSnackbar('Ошибка при сохранении данных', { variant: 'error' });
        }
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            company: {
                company_name: '',
                inn: '',
                address: '',
                phone: '',
                website: '',
                // logo приходит строкой (URL) с бэка, но мы его не отправляем обратно текстом
            }
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            company: Yup.object({
                company_name: Yup.string().required('Название обязательно'),
                inn: Yup.string().required('ИНН обязателен'),
                phone: Yup.string().required('Телефон обязателен'),
            })
        }),
        onSubmit: (values) => {
            // Используем FormData для отправки файлов + текста
            const formData = new FormData();

            // Основные поля юзера
            formData.append('email', values.email);

            // Вложенные поля компании
            // DRF с WritableNestedSerializer умеет понимать точки: 'company.field_name'
            formData.append('company.company_name', values.company.company_name);
            formData.append('company.inn', values.company.inn);
            formData.append('company.address', values.company.address || '');
            formData.append('company.phone', values.company.phone || '');
            formData.append('company.website', values.company.website || '');

            // Если выбрали новый логотип - добавляем файл
            if (logoFile) {
                formData.append('company.logo', logoFile);
            }

            mutation.mutate(formData);
        }
    });

    // Заполнение формы при загрузке данных
    useEffect(() => {
        if (data) {
            formik.setValues({
                email: data.email,
                company: data.company || {}
            });
            // Если есть логотип с сервера, ставим его как превью (если мы еще не выбрали новый)
            if (data.company?.logo && !logoFile) {
                setPreviewUrl(data.company.logo);
            }
        }
    }, [data]);

    // Обработчик выбора файла
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Создаем временную ссылку для показа
        }
    };

    if (isLoading) return <LinearProgress />;

    return (
        <Box maxWidth="md" sx={{ mx: "auto" }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, display:'flex', alignItems:'center', gap:1 }}>
                <Business /> Карточка Организации
            </Typography>

            <form onSubmit={formik.handleSubmit}>
                <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }} elevation={0}>

                    {/* СЕКЦИЯ ЛОГОТИПА */}
                    <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                                <IconButton
                                    color="primary"
                                    component="label"
                                    sx={{
                                        bgcolor: 'white',
                                        boxShadow: 2,
                                        width: 32, height: 32,
                                        '&:hover': { bgcolor: '#f5f5f5' }
                                    }}
                                >
                                    <input hidden accept="image/*" type="file" onChange={handleLogoChange} />
                                    <PhotoCamera sx={{ fontSize: 20 }} />
                                </IconButton>
                            }
                        >
                            <Avatar
                                src={previewUrl || undefined}
                                sx={{
                                    width: 100, height: 100,
                                    bgcolor: '#e3f2fd', color: '#1976d2',
                                    fontSize: 40, fontWeight: 'bold',
                                    border: '1px solid #e0e0e0'
                                }}
                            >
                                {/* Если нет картинки, показываем первую букву названия */}
                                {!previewUrl && formik.values.company.company_name?.[0]?.toUpperCase()}
                            </Avatar>
                        </Badge>
                        <Typography variant="caption" color="text.secondary" mt={1}>
                            Логотип организации
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                label="Название компании"
                                name="company.company_name"
                                value={formik.values.company.company_name}
                                onChange={formik.handleChange}
                                error={Boolean(formik.errors.company?.company_name)}
                                helperText={formik.errors.company?.company_name}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="ИНН (STIR)"
                                name="company.inn"
                                value={formik.values.company.inn}
                                onChange={formik.handleChange}
                                error={Boolean(formik.errors.company?.inn)}
                                helperText={formik.errors.company?.inn}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Юридический Адрес"
                                name="company.address"
                                multiline
                                value={formik.values.company.address}
                                onChange={formik.handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Контактный телефон"
                                name="company.phone"
                                value={formik.values.company.phone}
                                onChange={formik.handleChange}
                                error={Boolean(formik.errors.company?.phone)}
                                helperText={formik.errors.company?.phone}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Веб-сайт"
                                name="company.website"
                                placeholder="https://"
                                value={formik.values.company.website}
                                onChange={formik.handleChange}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email учетной записи (Логин)"
                                disabled
                                value={formik.values.email}
                                helperText="Используется для входа в систему"
                                InputProps={{ readOnly: true, sx: { bgcolor: '#f8f9fa' } }}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4, display:'flex', justifyContent:'flex-end' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            startIcon={<Save />}
                            disabled={mutation.isPending}
                            sx={{ borderRadius: 2, px: 4 }}
                        >
                            {mutation.isPending ? "Сохранение..." : "Сохранить изменения"}
                        </Button>
                    </Box>

                </Paper>
            </form>
        </Box>
    );
};

export default OrganizationPage;