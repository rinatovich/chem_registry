import { Box, Button, Paper, Typography, Card, CardContent, Chip, Grid } from '@mui/material';
import { Description, Download, PictureAsPdf } from '@mui/icons-material';
import { styles } from '../PublicElementPage.styles';
import { PdfThumbnail } from './PdfThumbnail.tsx';

interface ElementSidebarProps {
    attachments: any[];
}

export const ElementSidebar = ({ attachments }: ElementSidebarProps) => {
    return (
        <Box sx={{ mt: 2 }}> {/* Небольшой отступ сверху */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    bgcolor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 3,
                }}
            >
                {/* ЗАГОЛОВОК СЕКЦИИ */}
                <Box sx={{ mb: 3, pb: 1.5, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#3b82f6', display: 'inline-block' }} />
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 800,
                            color: '#334155',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontSize: '0.9rem'
                        }}
                    >
                        ПРИКРЕПЛЕННЫЕ ДОКУМЕНТЫ ({attachments?.length || 0})
                    </Typography>
                </Box>

                {!attachments?.length ? (
                    <Box sx={{ textAlign: 'center', color: '#94a3b8', py: 6, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                        <Description sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                        <Typography variant="body2" fontWeight="500">Нет прикрепленных документов</Typography>
                    </Box>
                ) : (
                    // === СЕТКА КАРТОЧЕК ===
                    <Grid container spacing={3}>
                        {attachments.map((file: any) => {
                            const isPdf = file.file.toLowerCase().endsWith('.pdf');

                            return (
                                // Адаптивность: на мобильном 1 колонка, на планшете 2 (sm=6), на десктопе 4 (md=3)
                                <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflow: 'hidden',
                                            border: '1px solid #f1f5f9',
                                            borderRadius: 2,
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                borderColor: '#cbd5e1',
                                                boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.08)'
                                            }
                                        }}
                                    >
                                        {/* ПРЕВЬЮ */}
                                        <Box
                                            sx={{
                                                height: 180, // Сделали чуть выше для галереи
                                                bgcolor: '#f8fafc',
                                                position: 'relative',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #f1f5f9'
                                            }}
                                            onClick={() => window.open(file.file, '_blank')}
                                        >
                                            <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
                                                {isPdf && (
                                                    <Chip
                                                        label="PDF"
                                                        size="small"
                                                        icon={<PictureAsPdf style={{fontSize: 12, color: 'white'}}/>}
                                                        sx={{ height: 22, fontSize: 10, fontWeight: 700, bgcolor: '#ef4444', color: 'white', '& .MuiChip-icon': { color: 'white' } }}
                                                    />
                                                )}
                                            </Box>

                                            {isPdf ? (
                                                <Box sx={{ width: '100%', mt: -1, opacity: 0.9 }}>
                                                    <PdfThumbnail url={file.file} width={400} />
                                                </Box>
                                            ) : (
                                                <Box component="img" src={file.file} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            )}
                                        </Box>

                                        {/* ИНФОРМАЦИЯ */}
                                        <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: '#334155',
                                                        fontSize: '0.9rem',
                                                        lineHeight: 1.3,
                                                        mb: 1,
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        minHeight: '2.6em' // Фиксированная высота заголовка для ровности
                                                    }}
                                                    title={file.description}
                                                >
                                                    {file.description || "Документ без названия"}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                                                    {new Date(file.uploaded_at).toLocaleDateString()}
                                                </Typography>
                                            </Box>

                                            <Button
                                                href={file.file}
                                                target="_blank"
                                                fullWidth
                                                variant="outlined"
                                                startIcon={<Download sx={{ fontSize: 16 }} />}
                                                sx={{
                                                    mt: 2,
                                                    fontSize: '0.75rem',
                                                    py: 0.5,
                                                    borderRadius: 1.5,
                                                    textTransform: 'none',
                                                    color: '#475569',
                                                    borderColor: '#e2e8f0',
                                                    '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1', color: '#0f172a' }
                                                }}
                                            >
                                                Скачать
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Paper>

            <Typography sx={{ fontSize: '11px', color: '#cbd5e1', textAlign: 'center', mt: 2, fontWeight: 500 }}>
                Предоставлено декларантом
            </Typography>
        </Box>
    );
};