import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Paper, Grid, LinearProgress,
    Skeleton, Button, Chip, Stack
} from '@mui/material';
import {
    ArrowBack, Science, WarningAmber, Assessment,
    Shield, LocalFireDepartment, Spa
} from '@mui/icons-material';
import { getStatistics } from '../../api/registry';

// Конфигурация цветов и иконок для классов
const HAZARD_CONFIG: Record<string, { label: string, color: string, icon: any, desc: string }> = {
    '1': { label: 'Чрезвычайно опасные', color: '#d32f2f', icon: <LocalFireDepartment />, desc: 'Требуют особого контроля' },
    '2': { label: 'Высокоопасные', color: '#ed6c02', icon: <WarningAmber />, desc: 'Строгие нормы обращения' },
    '3': { label: 'Умеренно опасные', color: '#fbc02d', icon: <Science />, desc: 'Стандартные меры защиты' },
    '4': { label: 'Малоопасные', color: '#2e7d32', icon: <Spa />, desc: 'Минимальные риски' },
    'NC': { label: 'Не классифицировано', color: '#9e9e9e', icon: <Shield />, desc: 'Данные отсутствуют' }
};

const StatisticsPage = () => {
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['stats-full'],
        queryFn: getStatistics,
        staleTime: 1000 * 60 * 5 // 5 минут кэша
    });

    const total = data?.total_elements || 0;
    const distribution = data?.hazard_distribution || [];

    // Подсчет процента
    const getPercent = (count: number) => total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>

            {/* --- ХЕДЕР --- */}
            <Box sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: 'white', pt: 4, pb: 12 }}>
                <Container maxWidth="lg">
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/')}
                        sx={{ color: 'white', mb: 2, opacity: 0.8, '&:hover': { opacity: 1 } }}
                    >
                        На главную
                    </Button>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Assessment sx={{ fontSize: 48, opacity: 0.9 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="800">Статистика Реестра</Typography>
                            <Typography variant="body1" sx={{ opacity: 0.8 }}>
                                Обзор данных национальной базы химических веществ
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* --- КОНТЕНТ --- */}
            <Container maxWidth="lg" sx={{ mt: -8 }}>

                {/* 1. ГЛАВНАЯ ЦИФРА */}
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, mb: 4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}>
                    <Grid container alignItems="center" spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="overline" color="text.secondary" fontWeight="700" letterSpacing={1}>
                                Общий объем данных
                            </Typography>
                            <Box display="flex" alignItems="baseline" gap={2} mt={1}>
                                {isLoading ? <Skeleton width={100} height={60} /> : (
                                    <Typography variant="h2" fontWeight="800" color="#1e293b">
                                        {total.toLocaleString()}
                                    </Typography>
                                )}
                                <Typography variant="h6" color="text.secondary" fontWeight="500">
                                    веществ
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 400 }}>
                                Количество уникальных химических соединений, зарегистрированных и прошедших модерацию в системе.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {/* Здесь можно было бы разместить круговую диаграмму, пока заглушка или иконка */}
                            <Box sx={{
                                bgcolor: '#eff6ff', borderRadius: 3, p: 3,
                                display: 'flex', alignItems: 'center', gap: 2,
                                border: '1px dashed #bfdbfe'
                            }}>
                                <Science sx={{ fontSize: 40, color: '#3b82f6' }} />
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="700" color="#1e3a8a">
                                        Актуальность данных
                                    </Typography>
                                    <Typography variant="caption" color="#64748b">
                                        Данные обновляются в реальном времени по мере проверки паспортов безопасности.
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                <Typography variant="h6" fontWeight="800" color="#334155" mb={3}>
                    Распределение по классам опасности (СанПиН)
                </Typography>

                {/* 2. СЕТКА КЛАССОВ */}
                <Grid container spacing={3}>
                    {isLoading ? (
                        [1, 2, 3, 4].map(i => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 3 }} />
                            </Grid>
                        ))
                    ) : (
                        distribution.map((item: any) => {
                            const code = item.sec11_class__sanpin_class || 'NC';
                            const count = item.count;
                            const percent = getPercent(count);
                            const conf = HAZARD_CONFIG[code] || HAZARD_CONFIG['NC'];

                            return (
                                <Grid item xs={12} sm={6} md={4} key={code}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3, borderRadius: 3, border: '1px solid #e2e8f0',
                                            height: '100%', display: 'flex', flexDirection: 'column',
                                            transition: 'transform 0.2s',
                                            '&:hover': { transform: 'translateY(-4px)', borderColor: conf.color }
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                            <Box sx={{
                                                p: 1.5, borderRadius: 2,
                                                bgcolor: `${conf.color}15`, color: conf.color
                                            }}>
                                                {conf.icon}
                                            </Box>
                                            <Chip label={`${percent}%`} size="small" sx={{ fontWeight: 700, bgcolor: '#f1f5f9' }} />
                                        </Box>

                                        <Typography variant="h4" fontWeight="800" color="#1e293b" mb={0.5}>
                                            {count}
                                        </Typography>
                                        <Typography variant="subtitle2" fontWeight="700" color="text.primary" gutterBottom>
                                            {code === 'NC' ? conf.label : `${code} Класс - ${conf.label}`}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block', flexGrow: 1 }}>
                                            {conf.desc}
                                        </Typography>

                                        <LinearProgress
                                            variant="determinate"
                                            value={percent}
                                            sx={{
                                                height: 6, borderRadius: 3, bgcolor: '#f1f5f9',
                                                '& .MuiLinearProgress-bar': { bgcolor: conf.color }
                                            }}
                                        />
                                    </Paper>
                                </Grid>
                            );
                        })
                    )}
                </Grid>

            </Container>
        </Box>
    );
};

export default StatisticsPage;