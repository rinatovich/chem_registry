import {
    Box, Paper, Typography, Checkbox, FormGroup, FormControlLabel,
    Accordion, AccordionSummary, AccordionDetails, Skeleton, Button
} from '@mui/material';
import { ExpandMore, FilterList, CleaningServices, InfoOutlined } from '@mui/icons-material';

interface FilterOption {
    value: string | boolean;
    label: string;
    count: number;
}

interface FilterGroup {
    title: string;
    options: FilterOption[];
}

interface FilterSidebarProps {
    data: Record<string, FilterGroup> | undefined;
    isLoading: boolean;
    activeFilters: Record<string, string>;
    onFilterChange: (key: string, value: string | null) => void;
}

export const FilterSidebar = ({ data, isLoading, activeFilters, onFilterChange }: FilterSidebarProps) => {

    // 1. СОСТОЯНИЕ ЗАГРУЗКИ (Показываем скелетон)
    if (isLoading) {
        return (
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
                <Box display="flex" gap={1} mb={2} alignItems="center">
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="text" width="60%" height={30} />
                </Box>
                {/* Имитация аккордеонов */}
                {[1, 2, 3].map((i) => (
                    <Box key={i} mb={2}>
                        <Skeleton variant="rectangular" height={32} sx={{ borderRadius: 1, mb: 1 }} />
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="text" width="70%" />
                    </Box>
                ))}
            </Paper>
        );
    }

    // 2. СОСТОЯНИЕ "НЕТ ДАННЫХ" (Пустой объект)
    if (!data || Object.keys(data).length === 0) {
        return (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc', textAlign: 'center' }}>
                <InfoOutlined sx={{ color: '#94a3b8', fontSize: 40, mb: 1 }} />
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                    Фильтры
                </Typography>
                <Typography variant="caption" color="text.disabled" display="block" mt={0.5} lineHeight={1.2}>
                    Параметры фильтрации пока не настроены администратором.
                </Typography>
            </Paper>
        );
    }

    // 3. ОБЫЧНОЕ СОСТОЯНИЕ
    return (
        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden', bgcolor: 'white' }}>
            {/* Заголовок */}
            <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                    <FilterList fontSize="small" color="action" />
                    <Typography variant="subtitle2" fontWeight="700" color="#334155">ФИЛЬТРЫ</Typography>
                </Box>
                {Object.keys(activeFilters).length > 0 && (
                    <Button
                        size="small"
                        color="error"
                        sx={{ minWidth:0, p:0.5 }}
                        onClick={() => Object.keys(activeFilters).forEach(k => onFilterChange(k, null))}
                    >
                        <CleaningServices fontSize="small"/>
                    </Button>
                )}
            </Box>

            {/* Список групп */}
            {Object.entries(data).map(([key, group], idx) => (
                <Accordion
                    key={key}
                    defaultExpanded={idx < 3} // Первые 3 открыты
                    disableGutters
                    elevation={0}
                    sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #f1f5f9' }}
                >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="body2" fontWeight="600" color="#1e293b">{group.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, pb: 1 }}>
                        <FormGroup>
                            {group.options.map((opt) => {
                                const valStr = String(opt.value);
                                const isChecked = activeFilters[key] === valStr;

                                return (
                                    <FormControlLabel
                                        key={valStr}
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={isChecked}
                                                onChange={() => onFilterChange(key, isChecked ? null : valStr)}
                                            />
                                        }
                                        label={
                                            <Box display="flex" justifyContent="space-between" width="100%" gap={1}>
                                                <Typography variant="body2" fontSize="0.85rem" sx={{ wordBreak: 'break-word' }}>{opt.label}</Typography>
                                                <Typography variant="caption" color="text.secondary">({opt.count})</Typography>
                                            </Box>
                                        }
                                        sx={{
                                            ml: 0, mr: 0,
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            alignItems: 'flex-start', // Выравнивание по верху для длинных текстов
                                            '& .MuiFormControlLabel-label': { width: '100%', pt: 0.2 }
                                        }}
                                    />
                                );
                            })}
                        </FormGroup>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Paper>
    );
};