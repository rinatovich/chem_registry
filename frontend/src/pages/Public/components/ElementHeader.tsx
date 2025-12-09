import { Box, Button, Chip, Typography, Paper } from '@mui/material';
import { ArrowBack, PictureAsPdf } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { downloadPassport } from '../../../api/registry';
import { styles } from '../PublicElementPage.styles';

interface ElementHeaderProps {
    data: any;
    disableGutters?: boolean; // Опциональный проп, если нужно управлять отступами из родителя
}

export const ElementHeader = ({ data }: ElementHeaderProps) => {
    const navigate = useNavigate();

    // Ссылка на картинку структуры (если есть)
    const structureImage = data.sec1_identification?.structure_image;

    return (
        <Box>
            {/* Кнопка "Назад" */}
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/')}
                sx={{
                    mb: 3,
                    color: '#64748b',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'transparent', color: '#0f172a'}
                }}
            >
                Назад к списку
            </Button>

            {/* Основной блок заголовка */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 3
            }}>

                {/* ЛЕВАЯ ЧАСТЬ: Картинка + Название */}
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flex: 1 }}>

                    {/* 1. Картинка структуры (Рендерится только если есть URL) */}
                    {structureImage && (
                        <Paper
                            elevation={0}
                            sx={{
                                width: 120,
                                height: 120,
                                flexShrink: 0, // Не сжимать картинку
                                border: '1px solid #e2e8f0',
                                borderRadius: 3,
                                p: 1,
                                bgcolor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}
                        >
                            <img
                                src={structureImage}
                                alt="Structure"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain' // Вписать пропорционально
                                }}
                            />
                        </Paper>
                    )}

                    {/* 2. Текстовая информация */}
                    <Box>
                        <Typography variant="h1" sx={styles.elementTitle}>
                            {data.primary_name_ru}
                        </Typography>

                        <Box sx={styles.metaInfo}>
                            {/* Статус */}
                            <Chip
                                label="ОПУБЛИКОВАНО"
                                color="success"
                                size="small"
                                sx={{ fontWeight: 800, borderRadius: 1, px: 1 }}
                            />

                            {/* Дата обновления */}
                            <Typography variant="body2" sx={styles.metaText}>
                                Обновлено: {new Date(data.updated_at).toLocaleDateString()}
                            </Typography>

                            {/* CAS Номер */}
                            {data.cas_number && (
                                <Chip
                                    label={`CAS: ${data.cas_number}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        fontWeight: 600,
                                        color: '#475569',
                                        borderColor: '#cbd5e1',
                                        bgcolor: '#f8fafc'
                                    }}
                                />
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* ПРАВАЯ ЧАСТЬ: Кнопка Скачать */}
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<PictureAsPdf />}
                    onClick={() => downloadPassport(data.id, `Passport_${data.id}.pdf`)}
                    sx={{
                        boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)',
                        borderRadius: 2,
                        px: 3,
                        py: 1.2,
                        fontWeight: 700,
                        whiteSpace: 'nowrap' // Чтобы текст не переносился
                    }}
                >
                    Скачать Паспорт
                </Button>
            </Box>
        </Box>
    );
}