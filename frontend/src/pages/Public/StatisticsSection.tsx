import { useQuery } from '@tanstack/react-query';
import { Box, Grid, Typography, LinearProgress, Skeleton } from '@mui/material';
import { Science, WarningAmber } from '@mui/icons-material';
import { getStatistics } from '../../api/registry';

// Настройка цветов и названий для классов опасности
const HAZARD_CONFIG: Record<string, { label: string, color: string }> = {
    '1': { label: '1 - Чрезвычайно опасные', color: '#d32f2f' },
    '2': { label: '2 - Высокоопасные', color: '#ed6c02' },
    '3': { label: '3 - Умеренно опасные', color: '#fbc02d' },
    '4': { label: '4 - Малоопасные', color: '#2e7d32' },
    'NC': { label: 'Не классифицировано', color: '#9e9e9e' }
};

export const StatisticsSection = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['stats'],
        queryFn: getStatistics,
        staleTime: 1000 * 60 * 15,
    });

    if (isLoading) {
        return (
            <Grid container spacing={4} sx={{ p: 4 }}>
                <Grid item xs={12} md={4}><Skeleton variant="rectangular" height={100} /></Grid>
                <Grid item xs={12} md={8}><Skeleton variant="text" /><Skeleton variant="rectangular" height={80} /></Grid>
            </Grid>
        );
    }

    if (!data) return null;

    const total = data.total_elements || 0;
    const distribution = data.hazard_distribution || [];

    // Считаем проценты для прогресс-баров
    const getPercent = (count: number) => total > 0 ? (count / total) * 100 : 0;

    return (
        <Box sx={{ width: '100%', p: { xs: 3, md: 5 } }}> {/* Только внутренние отступы */}
            <Grid container spacing={6} alignItems="center">

                {/* ЛЕВАЯ ЧАСТЬ: ОБЩАЯ ЦИФРА */}
                <Grid item xs={12} md={4} sx={{ borderRight: { md: '1px solid #f1f5f9' }, textAlign: 'center' }}>
                    <Box
                        sx={{
                            display: 'inline-flex', p: 2.5, borderRadius: '50%',
                            bgcolor: '#eff6ff', color: '#2563eb', mb: 2
                        }}
                    >
                        <Science sx={{ fontSize: 40 }} />
                    </Box>
                    <Typography variant="h2" fontWeight="800" color="#1e293b" sx={{ lineHeight: 1 }}>
                        {total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="500" mt={1}>
                        Химических веществ в реестре
                    </Typography>
                </Grid>

                {/* ПРАВАЯ ЧАСТЬ: РАСПРЕДЕЛЕНИЕ ПО КЛАССАМ */}
                <Grid item xs={12} md={8}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                        <WarningAmber color="action" />
                        <Typography variant="h6" fontWeight="700" color="#334155">
                            Классификация опасности (СанПиН)
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {distribution.map((item: any) => {
                            const code = item.sec11_class__sanpin_class || 'NC';
                            const count = item.count;
                            const config = HAZARD_CONFIG[code] || HAZARD_CONFIG['NC'];

                            return (
                                <Grid item xs={12} sm={6} key={code}>
                                    <Box mb={1} display="flex" justifyContent="space-between" alignItems="flex-end">
                                        <Typography variant="caption" fontWeight="700" sx={{ color: config.color, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                            {config.label}
                                        </Typography>
                                        <Typography variant="body2" fontWeight="700" color="#1e293b">
                                            {count} шт.
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={getPercent(count)}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: '#f1f5f9',
                                            '& .MuiLinearProgress-bar': { bgcolor: config.color }
                                        }}
                                    />
                                </Grid>
                            )
                        })}

                        {distribution.length === 0 && (
                            <Typography variant="body2" color="text.disabled" sx={{ pl: 3 }}>
                                Нет данных для статистики
                            </Typography>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};