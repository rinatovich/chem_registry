import { useState } from 'react';
import {
    Box, Fab, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Typography, Alert, LinearProgress, IconButton, Tooltip
} from '@mui/material';
import { BugReport, Close, AttachFile, Send } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { sendSupportTicket } from '../../../api/support';
import { useSnackbar } from 'notistack';

export const SupportFab = () => {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const { enqueueSnackbar } = useSnackbar();

    const formik = useFormik({
        initialValues: {
            email: '',
            subject: '',
            message: ''
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Некорректный Email').required('Укажите Email для ответа'),
            subject: Yup.string().required('Укажите тему'),
            message: Yup.string().required('Опишите проблему')
        }),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                await sendSupportTicket({
                    subject: values.subject,
                    message: values.message,
                    contact_email: values.email,
                    file: file
                });
                enqueueSnackbar('Сообщение отправлено! Спасибо за помощь.', { variant: 'success' });
                resetForm();
                setFile(null);
                setOpen(false);
            } catch (e) {
                enqueueSnackbar('Ошибка отправки. Попробуйте позже.', { variant: 'error' });
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <>
            {/* ПЛАВАЮЩАЯ КНОПКА */}
            <Tooltip title="Сообщить об ошибке / Поддержка" placement="left">
                <Fab
                    color="error"
                    aria-label="support"
                    onClick={() => setOpen(true)}
                    sx={{
                        position: 'fixed',
                        bottom: 30,
                        right: 30,
                        zIndex: 1000,
                        boxShadow: '0 4px 20px rgba(211, 47, 47, 0.4)',
                        animation: 'pulse 2s infinite'
                    }}
                >
                    <BugReport />
                </Fab>
            </Tooltip>

            {/* МОДАЛЬНОЕ ОКНО */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Техническая поддержка
                    <IconButton onClick={() => setOpen(false)}><Close /></IconButton>
                </DialogTitle>

                <form onSubmit={formik.handleSubmit}>
                    <DialogContent dividers>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Нашли ошибку или есть идея? Напишите нам!
                            Мы работаем в режиме тестирования.
                        </Alert>

                        <TextField
                            fullWidth margin="normal"
                            label="Ваш Email" name="email"
                            placeholder="name@example.com"
                            value={formik.values.email} onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                        />

                        <TextField
                            fullWidth margin="normal"
                            label="Тема" name="subject"
                            value={formik.values.subject} onChange={formik.handleChange}
                            error={formik.touched.subject && Boolean(formik.errors.subject)}
                            helperText={formik.touched.subject && formik.errors.subject}
                        />

                        <TextField
                            fullWidth margin="normal"
                            label="Описание" name="message"
                            multiline rows={4}
                            placeholder="Что пошло не так..."
                            value={formik.values.message} onChange={formik.handleChange}
                            error={formik.touched.message && Boolean(formik.errors.message)}
                            helperText={formik.touched.message && formik.errors.message}
                        />

                        <Box mt={2}>
                            <Button component="label" size="small" startIcon={<AttachFile />}>
                                {file ? file.name : "Прикрепить скриншот"}
                                <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
                            </Button>
                        </Box>

                        {formik.isSubmitting && <LinearProgress sx={{ mt: 2 }} />}
                    </DialogContent>

                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setOpen(false)} color="inherit">Отмена</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            startIcon={<Send />}
                            disabled={formik.isSubmitting}
                        >
                            Отправить
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
};