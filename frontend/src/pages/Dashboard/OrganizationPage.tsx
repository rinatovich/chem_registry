import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Box, Typography, Paper, Grid, TextField, Button, LinearProgress, Divider
} from '@mui/material';
import { Save, Business } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getProfile, updateProfile } from '../../api/auth';

const OrganizationPage = () => {
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();

    // Загрузка
    const { data, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
    });

    // Сохранение
    const mutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            enqueueSnackbar('Информация об организации обновлена', { variant: 'success' });
            queryClient.invalidateQueries({ queryKey: ['profile'] }); // Обновить данные в хедере
        },
        onError: () => {
            enqueueSnackbar('Ошибка при сохранении', { variant: 'error' });
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
                website: ''
            }
        },
        enableReinitialize: true, // Важно, чтобы подгрузились данные после загрузки
        validationSchema: Yup.object({
            company: Yup.object({
                company_name: Yup.string().required('Название обязательно'),
                inn: Yup.string().required('ИНН обязателен'),
                phone: Yup.string().required('Телефон обязателен'),
            })
        }),
        onSubmit: (values) => {
            // Бэкенд ждет { company_profile: ... } но наш метод update ожидает профиль
            // В сериалайзере мы определили чтение source='company_profile'
            // А в updateProfile API отправляем { email, company: { ... } }
            // Бэкенд-сериалайзер настроен понимать JSON и обновлять поля

            // Приводим структуру к тому, что ждет Serializer update
            const payload = {
                email: values.email,
                company_profile: values.company // Переименуем ключ под Serializer
            }
            mutation.mutate(payload);
        }
    });

    // Костыль для заполнения формы при приходе данных
    useEffect(() => {
        if (data) {
            formik.setValues({
                email: data.email,
                company: data.company || {}
            });
        }
    }, [data]);

    if (isLoading) return <LinearProgress />;

    return (
        <Box maxWidth="md" sx={{ mx: "auto" }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, display:'flex', alignItems:'center', gap:1 }}>
                <Business /> Карточка Организации
            </Typography>

            <form onSubmit={formik.handleSubmit}>
                <Paper sx={{ p: 4, borderRadius: 3 }}>
                    <Typography variant="h6" gutterBottom>Контактные данные</Typography>
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
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="ИНН (STIR)"
                                name="company.inn"
                                value={formik.values.company.inn}
                                onChange={formik.handleChange}
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
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Email (Логин)"
                                disabled
                                value={formik.values.email}
                                helperText="Для смены email обратитесь в техподдержку"
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
                        >
                            Сохранить изменения
                        </Button>
                    </Box>

                </Paper>
            </form>
        </Box>
    );
};

export default OrganizationPage;