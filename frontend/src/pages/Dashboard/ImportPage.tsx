import { useState, useRef, useEffect } from 'react';
import {
    Paper, Typography, Box, Button, LinearProgress, Alert,
    List, ListItem, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import {
    CloudUpload, Download, InsertDriveFile, CheckCircle, Error as ErrorIcon
} from '@mui/icons-material';
import { downloadTemplate, uploadFile, checkTask, type TaskResponse } from '../../api/registry';
import { useSnackbar } from 'notistack';

const ImportPage = () => {
    const { enqueueSnackbar } = useSnackbar();

    // Состояния
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [taskData, setTaskData] = useState<TaskResponse | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // === 1. Логика поллинга (опроса сервера) ===
    useEffect(() => {
        let intervalId: any;

        if (taskId && uploading) {
            intervalId = setInterval(async () => {
                try {
                    const data = await checkTask(taskId);
                    setTaskData(data);

                    // Если готово - останавливаем
                    if (['SUCCESS', 'DONE', 'FAILURE', 'ERROR'].includes(data.status)) {
                        setUploading(false);
                        if (data.result?.errors && data.result.errors.length === 0) {
                            enqueueSnackbar('Импорт успешно завершен!', { variant: 'success' });
                        } else {
                            enqueueSnackbar('Импорт завершен с замечаниями', { variant: 'warning' });
                        }
                    }
                } catch (e) {
                    console.error(e);
                    setUploading(false);
                    enqueueSnackbar('Ошибка при проверке статуса', { variant: 'error' });
                }
            }, 2000); // Спрашиваем каждые 2 секунды
        }

        return () => clearInterval(intervalId); // Чистим при выходе
    }, [taskId, uploading]);

    // === 2. Обработчики ===
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            // Сбрасываем старые результаты
            setTaskId(null);
            setTaskData(null);
        }
    };

    const handleStartUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        try {
            const res = await uploadFile(selectedFile);
            setTaskId(res.task_id);
        } catch (e) {
            setUploading(false);
            enqueueSnackbar('Ошибка при загрузке файла', { variant: 'error' });
        }
    };

    return (
        <Box maxWidth="800px" mx="auto">
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Мастер Импорта Данных
            </Typography>

            {/* ШАГ 1: ИНСТРУКЦИЯ И ШАБЛОН */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>1. Подготовка файла</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Загрузите актуальный шаблон Excel. Обратите внимание: колонки со звездочкой (*) обязательны к заполнению.
                    Используйте выпадающие списки в ячейках для выбора стандартных значений (например, Класс опасности).
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={downloadTemplate}
                >
                    Скачать Шаблон.xlsx
                </Button>
            </Paper>

            {/* ШАГ 2: ЗАГРУЗКА */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>2. Загрузка данных</Typography>

                <Box
                    sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        bgcolor: '#fafafa',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#f0f0f0', borderColor: 'primary.main' }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        accept=".xlsx"
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    {selectedFile ? (
                        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', gap:1 }}>
                            <InsertDriveFile color="primary" sx={{ fontSize: 40 }} />
                            <Typography variant="h6">{selectedFile.name}</Typography>
                        </Box>
                    ) : (
                        <>
                            <CloudUpload color="action" sx={{ fontSize: 48, mb: 1 }} />
                            <Typography>Нажмите или перетащите файл сюда</Typography>
                            <Typography variant="caption" color="text.secondary">Только .xlsx файлы</Typography>
                        </>
                    )}
                </Box>

                <Box sx={{ mt: 3, display:'flex', justifyContent:'flex-end' }}>
                    <Button
                        variant="contained"
                        size="large"
                        disabled={!selectedFile || uploading}
                        onClick={handleStartUpload}
                        startIcon={uploading && <CircularProgress size={20} color="inherit"/>}
                    >
                        {uploading ? 'Обработка...' : 'Начать Импорт'}
                    </Button>
                </Box>

                {/* ПРОГРЕСС БАР */}
                {uploading && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" gutterBottom>Сервер обрабатывает файл...</Typography>
                        <LinearProgress variant="indeterminate" />
                    </Box>
                )}
            </Paper>

            {/* ШАГ 3: РЕЗУЛЬТАТЫ */}
            {taskData && ['DONE', 'SUCCESS', 'FINISHED'].includes(taskData.status) && taskData.result && (
                <Paper sx={{ p: 3, borderLeft: '6px solid', borderColor: (taskData.result.imported || 0) > 0 ? 'success.main' : 'warning.main' }}>
                    <Box sx={{ display:'flex', alignItems:'center', gap: 2, mb: 2 }}>
                        {(taskData.result.imported || 0) > 0
                            ? <CheckCircle color="success" sx={{ fontSize: 40 }} />
                            : <ErrorIcon color="warning" sx={{ fontSize: 40 }} />
                        }
                        <Box>
                            <Typography variant="h6">Обработка завершена</Typography>
                            <Typography variant="body2">
                                Успешно создано: <b>{taskData.result.imported ?? 0}</b> элементов.
                            </Typography>
                        </Box>
                    </Box>

                    {/* Ошибки валидации */}
                    {taskData.result.errors && taskData.result.errors.length > 0 ? (
                        <Box sx={{ mt: 2, bgcolor: '#fff5f5', p: 2, borderRadius: 2 }}>
                            <Typography variant="subtitle2" color="error" gutterBottom sx={{ fontWeight: 'bold' }}>
                                Обнаружены замечания ({taskData.result.errors.length}):
                            </Typography>
                            <List dense disablePadding>
                                {taskData.result.errors.map((err, idx) => (
                                    <ListItem key={idx} disablePadding sx={{ alignItems: 'flex-start', py: 0.5 }}>
                                        <ListItemIcon sx={{ minWidth: 30, mt: 0.5 }}><ErrorIcon fontSize="small" color="error"/></ListItemIcon>
                                        <ListItemText
                                            primary={err}
                                            primaryTypographyProps={{ fontSize: 13, color: 'text.primary', style: { wordBreak: 'break-word' } }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    ) : null}
                </Paper>
            )}
        </Box>
    );
};
import { CircularProgress } from '@mui/material'; // Не забудьте до-импортировать это

export default ImportPage;