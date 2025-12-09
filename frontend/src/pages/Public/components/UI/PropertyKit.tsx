import { Box, Grid, Typography, Paper, Divider, Chip } from '@mui/material';
import { CheckCircle, Cancel, HelpOutline } from '@mui/icons-material';

// --- 1. ТИПЫ ---
interface PropertyItemProps {
    label: string;
    value?: any;
    isBool?: boolean;
    // Опционально: можно добавить цвет или иконку
}

interface PropertyGroupProps {
    title?: string;
    children: React.ReactNode;
}

// Хелпер для форматирования значений (можно вынести в utils)
const formatValue = (val: any) => {
    if (val === null || val === undefined || val === '') return '—';
    const map: Record<string, string> = {
        'SOLID': 'Твердое вещество', 'LIQUID': 'Жидкость', 'GAS': 'Газ',
        'VAPOR': 'Пар', 'AEROSOL': 'Аэрозоль',
        'NONE': 'Отсутствует', 'SHARP': 'Резкий', 'SPECIFIC': 'Специфический',
        'FRUIT': 'Фруктовый', 'OTHER': 'Другое'
    };
    return map[String(val)] || val;
};

// --- 2. КОМПОНЕНТ ОДНОГО ПОЛЯ (PropertyItem) ---
export const PropertyItem = ({ label, value, isBool = false }: PropertyItemProps) => {
    // Если значения нет, мы рендерим "—", чтобы не ломать сетку (или возвращаем null, если хотим скрывать)
    const displayValue = formatValue(value);

    // Если нужно скрывать пустые поля полностью:
    if ((value === null || value === undefined || value === "") && !isBool) return null;

    return (
        <Box sx={{ mb: 2 }}>
            <Typography
                variant="caption"
                sx={{
                    color: '#64748b',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 0.5,
                    fontSize: '0.7rem'
                }}
            >
                {label}
            </Typography>

            <Box sx={{ minHeight: 24, display: 'flex', alignItems: 'center' }}>
                {isBool ? (
                    value ?
                        <Chip icon={<CheckCircle style={{ fontSize: 16 }}/>} label="Да" size="small" color="success" variant="outlined" sx={{ fontWeight: 600, height: 24 }} /> :
                        <Chip icon={<Cancel style={{ fontSize: 16 }}/>} label="Нет" size="small" color="default" variant="outlined" sx={{ fontWeight: 600, height: 24, borderColor: '#e2e8f0' }} />
                ) : (
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#0f172a',
                            fontWeight: 500,
                            fontSize: '0.95rem',
                            lineHeight: 1.4,
                            wordBreak: 'break-word'
                        }}
                    >
                        {displayValue}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

// --- 3. КОМПОНЕНТ ГРУППЫ (PropertyGroup) ---
export const PropertyGroup = ({ title, children }: PropertyGroupProps) => {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                height: '100%', // Чтобы карточки в одной строке были одинаковой высоты
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                transition: 'box-shadow 0.2s',
                '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }
            }}
        >
            {title && (
                <Box sx={{ mb: 2.5, pb: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 800,
                            color: '#334155',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        {/* Маленький декоративный элемент */}
                        <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#3b82f6', display: 'inline-block' }} />
                        {title}
                    </Typography>
                </Box>
            )}

            <Grid container spacing={2}>
                {children}
            </Grid>
        </Paper>
    );
};

// Хелпер для обертки PropertyItem в Grid (чтобы не писать <Grid item xs={...}> каждый раз)
export const FieldWrapper = ({ children, xs = 12, sm = 6, md = 6 }: { children: React.ReactNode, xs?: number, sm?: number, md?: number }) => (
    <Grid item xs={xs} sm={sm} md={md}>
        {children}
    </Grid>
);