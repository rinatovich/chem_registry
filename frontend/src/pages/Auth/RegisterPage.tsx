import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    Container, Card, Typography, Box, TextField, Button, Grid,
    Checkbox, FormControlLabel, Divider, Alert, CircularProgress
} from '@mui/material';
import { registerUser } from '../../api/auth'; // Импортируем функцию
import { Business, Person } from '@mui/icons-material';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');
    const [success, setSuccess] = useState(false);

    const formik = useFormik({
        initialValues: {
            username: '',
            email: '',
            password: '',
            // Данные компании
            company_name: '',
            inn: '',
            address: '',
            phone: '',
            // Роли
            is_manufacturer: false,
            is_importer: false,
            is_exporter: false
        },
        validationSchema: Yup.object({
            username: Yup.string().required('Обязательно'),
            email: Yup.string().email('Некорректный email').required('Обязательно'),
            password: Yup.string().min(6, 'Минимум 6 символов').required('Обязательно'),
            company_name: Yup.string().required('Название компании обязательно'),
            inn: Yup.string().required('ИНН обязателен').length(9, 'ИНН должен быть 9 цифр'), // Для примера
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                setServerError('');
                // Преобразуем плоский объект в вложенный для API (как ждет бэкенд)
                const payload = {
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    company: {
                        company_name: values.company_name,
                        inn: values.inn,
                        address: values.address,
                        phone: values.phone,
                        is_manufacturer: values.is_manufacturer,
                        is_importer: values.is_importer,
                        is_exporter: values.is_exporter
                    }
                };

                await registerUser(payload);
                setSuccess(true);
            } catch (err: any) {
                console.error(err);
                // Пытаемся достать текст ошибки из Django
                const msg = err.response?.data?.username ?
                    `Логин занят` : (JSON.stringify(err.response?.data) || "Ошибка сервера");
                setServerError(msg);
            } finally {
                setSubmitting(false);
            }
        },
    });

    if (success) {
        return (
            <Container maxWidth="sm" sx={{ mt: 10 }}>
                <Card sx={{ p: 5, textAlign: 'center' }}>
                    <Box sx={{ color: 'success.main', mb: 2, fontSize: 60 }}>🎉</Box>
                    <Typography variant="h4" gutterBottom>Регистрация успешна!</Typography>
                    <Typography color="text.secondary" paragraph>
                        Ваш аккаунт создан. Теперь вы можете войти в систему под своим логином.
                    </Typography>
                    <Button variant="contained" size="large" onClick={() => navigate('/login')}>
                        Перейти к входу
                    </Button>
                </Card>
            </Container>
        )
    }

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Box textAlign="center" mb={4}>
                <Typography variant="h4" fontWeight="bold" color="primary.main">Регистрация Поставщика</Typography>
                <Typography color="text.secondary">Заявка на подключение к Национальному реестру</Typography>
            </Box>

            <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                    {/* БЛОК 1: ДАННЫЕ ВХОДА */}
                    <Grid item xs={12} md={5}>
                        <Card sx={{ p: 3, height: '100%' }}>
                            <Box display="flex" alignItems="center" mb={2} gap={1} color="primary.dark">
                                <Person /> <Typography variant="h6">Учетная запись</Typography>
                            </Box>

                            {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

                            <TextField
                                fullWidth label="Логин (для входа)" name="username"
                                margin="normal"
                                value={formik.values.username} onChange={formik.handleChange}
                                error={Boolean(formik.errors.username)} helperText={formik.errors.username}
                            />
                            <TextField
                                fullWidth label="Email (для писем)" name="email"
                                margin="normal"
                                value={formik.values.email} onChange={formik.handleChange}
                                error={Boolean(formik.errors.email)} helperText={formik.errors.email}
                            />
                            <TextField
                                fullWidth label="Пароль" name="password" type="password"
                                margin="normal"
                                value={formik.values.password} onChange={formik.handleChange}
                                error={Boolean(formik.errors.password)} helperText={formik.errors.password}
                            />
                            <Divider sx={{ my: 3 }} />
                            <Typography variant="body2">
                                Уже есть аккаунт? <Link to="/login">Войти</Link>
                            </Typography>
                        </Card>
                    </Grid>

                    {/* БЛОК 2: ДАННЫЕ КОМПАНИИ */}
                    <Grid item xs={12} md={7}>
                        <Card sx={{ p: 3, height: '100%' }}>
                            <Box display="flex" alignItems="center" mb={2} gap={1} color="primary.dark">
                                <Business /> <Typography variant="h6">Данные Юр. Лица</Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth label="Название организации" name="company_name"
                                        placeholder="ООО 'Uzkimyosanoat'..."
                                        value={formik.values.company_name} onChange={formik.handleChange}
                                        error={Boolean(formik.errors.company_name)} helperText={formik.errors.company_name}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth label="ИНН (STIR)" name="inn"
                                        value={formik.values.inn} onChange={formik.handleChange}
                                        error={Boolean(formik.errors.inn)} helperText={formik.errors.inn}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth label="Телефон" name="phone"
                                        value={formik.values.phone} onChange={formik.handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth label="Юридический Адрес" name="address"
                                        value={formik.values.address} onChange={formik.handleChange}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3, bgcolor: '#f9fafb', p: 2, borderRadius: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>Тип деятельности (отметьте все):</Typography>
                                <FormControlLabel
                                    control={<Checkbox name="is_manufacturer" checked={formik.values.is_manufacturer} onChange={formik.handleChange} />}
                                    label="Производитель"
                                />
                                <FormControlLabel
                                    control={<Checkbox name="is_importer" checked={formik.values.is_importer} onChange={formik.handleChange} />}
                                    label="Импортер"
                                />
                                <FormControlLabel
                                    control={<Checkbox name="is_exporter" checked={formik.values.is_exporter} onChange={formik.handleChange} />}
                                    label="Экспортер"
                                />
                            </Box>

                            <Button
                                fullWidth
                                size="large"
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={formik.isSubmitting}
                                sx={{ mt: 3 }}
                            >
                                {formik.isSubmitting ? <CircularProgress size={24}/> : "Зарегистрироваться"}
                            </Button>
                        </Card>
                    </Grid>
                </Grid>
            </form>
        </Container>
    );
};

export default RegisterPage;