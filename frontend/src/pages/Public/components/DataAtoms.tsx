import { Box, Chip, Typography } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { styles } from '../PublicElementPage.styles';
import { formatValue } from '../utils/formatters';

// === СТРОКА ДАННЫХ (Умная) ===
export const InfoRow = ({ label, value, isBool = false }: { label: string, value?: any, isBool?: boolean }) => {

    // --- ИСПРАВЛЕНИЕ: СКРЫВАЕМ ПУСТОЕ ---
    if (value === null || value === undefined || value === "") {
        // Исключение: для Boolean мы можем хотеть показать "Нет", если False.
        // Но обычно в паспортах, если свойства нет, его просто не пишут.
        if (!isBool) return null;
        // Для boolean, если null/undefined, тоже скрываем. Если false - показываем "Нет".
        if (value === null || value === undefined) return null;
    }
    // ------------------------------------

    return (
        <Box sx={styles.rowContainer}>
            <Typography variant="body2" sx={styles.rowLabel}>
                {label}
            </Typography>

            <Box>
                {isBool ? (
                    value ?
                        <Chip icon={<CheckCircle />} label="Да" size="small" sx={{ fontWeight: 600, border: '1px solid #b7eb8f', bgcolor: '#f6ffed', color: '#389e0d', height: 24 }} /> :
                        <Chip icon={<Cancel />} label="Нет" size="small" sx={{ fontWeight: 600, border: '1px solid #d9d9d9', bgcolor: '#fafafa', color: '#8c8c8c', height: 24 }} />
                ) : (
                    <Typography sx={styles.rowValue}>
                        {formatValue(value)}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export const SectionHeader = ({ title }: { title: string }) => (
    <Box sx={styles.sectionHeaderBox}>
        <Box sx={styles.sectionHeaderLine}></Box>
        <Typography sx={styles.sectionHeaderText}>
            {title}
        </Typography>
    </Box>
);