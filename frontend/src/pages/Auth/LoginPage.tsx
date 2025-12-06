import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, TextField, Typography, Card, Container, Alert, LinearProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { useNavigate, Link } from 'react-router-dom';


const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: {
            username: '',
            password: '',
        },
        validationSchema: Yup.object({
            username: Yup.string().required('Введите логин'),
            password: Yup.string().required('Введите пароль'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            setErrorMsg(null);
            try {
                // Запрос к Django
                const res = await client.post('/token/', values);

                // Если успех - сохраняем токены
                login(res.data.access, res.data.refresh);

                // И переходим в кабинет
                navigate('/dashboard');
            } catch (err: any) {
                console.error(err);
                setErrorMsg('Неверный логин или пароль');
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card sx={{ p: 4, width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Нет аккаунта?{' '}
                        <Link to="/register" style={{ fontWeight: 'bold', color: '#1976d2', textDecoration: 'none' }}>
                            Регистрация
                        </Link>
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Box sx={{ width: 60, height: 60, bgcolor: '#1E3A8A', color: 'white', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 20 }}>
                        UZ
                    </Box>
                    <Typography variant="h5" sx={{ mt: 2, fontWeight: 700, color: '#1E3A8A' }}>
                        Вход в систему
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Национальный реестр ОХВ
                    </Typography>
                </Box>

                {formik.isSubmitting && <LinearProgress />}
                {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

                <form onSubmit={formik.handleSubmit}>
                    <TextField
                        fullWidth
                        id="username"
                        name="username"
                        label="Логин / ИНН"
                        margin="normal"
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        error={formik.touched.username && Boolean(formik.errors.username)}
                        helperText={formik.touched.username && formik.errors.username}
                    />
                    <TextField
                        fullWidth
                        id="password"
                        name="password"
                        label="Пароль"
                        type="password"
                        margin="normal"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />

                    <Button
                        color="primary"
                        variant="contained"
                        fullWidth
                        type="submit"
                        sx={{ mt: 3, py: 1.5, fontSize: '1rem' }}
                        disabled={formik.isSubmitting}
                    >
                        Войти
                    </Button>
                </form>
            </Card>
        </Container>
    );
};

export default LoginPage;