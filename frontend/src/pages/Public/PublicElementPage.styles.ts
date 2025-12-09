import type { SxProps, Theme } from '@mui/material';

export const styles = {
    pageContainer: {
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        pb: 8,
        display: 'flex',          // Flex
        flexDirection: 'column',
        alignItems: 'center',     // Центрирование по вертикальной оси всей страницы
    } as SxProps<Theme>,

    // Хак для принудительного растягивания контента внутри
    contentWrapper: {
        width: '100%',
        maxWidth: '1280px', // Уменьшили с 1600px до 1280px (стандартный лаптоп/десктоп)
        px: { xs: 2, md: 3 },
        margin: '0 auto',
    } as SxProps<Theme>,

    headerPaper: {
        bgcolor: '#fff',
        borderBottom: '1px solid #e2e8f0',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        mb: 4
    } as SxProps<Theme>,

    // === КАРТОЧКА ДАННЫХ ===
    rowContainer: {
        mb: 2,
        pb: 1,
        borderBottom: '1px solid #f1f5f9', // Легкая линия разделитель
        '&:last-child': {
            borderBottom: 'none'
        }
    } as SxProps<Theme>,

    rowLabel: {
        color: '#64748b',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.5px',
        mb: 0.5,
        textTransform: 'uppercase'
    } as SxProps<Theme>,

    rowValue: {
        fontSize: '15px',
        color: '#1e293b',
        fontWeight: 500,
        lineHeight: 1.4,
        wordBreak: 'break-word', // Чтобы длинные хим. формулы не ломали верстку
        whiteSpace: 'pre-wrap'
    } as SxProps<Theme>,

    // === ДРУГИЕ СТИЛИ ===
    elementTitle: { fontWeight: 800, color: '#0f172a', mb: 1, lineHeight: 1.1, fontSize: { xs: '1.8rem', md: '2.5rem'} } as SxProps<Theme>,
    metaInfo: { display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' } as SxProps<Theme>,
    metaText: { color: '#64748b', fontSize: '13px' } as SxProps<Theme>,

    sectionHeaderBox: {
        mt: 4, mb: 2, display: 'flex', alignItems: 'center', pb: 1,
        borderBottom: '2px solid #e2e8f0'
    } as SxProps<Theme>,
    sectionHeaderLine: { width: 4, height: 18, bgcolor: '#2563eb', mr: 1.5, borderRadius: 4 } as SxProps<Theme>,
    sectionHeaderText: { fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', fontSize: '0.95rem' } as SxProps<Theme>,

    tabsPaper: {
        borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)', bgcolor: 'white'
    } as SxProps<Theme>,
    tabsList: { borderBottom: 1, borderColor: '#e2e8f0', bgcolor: '#fafafa', '& .MuiTab-root': { fontWeight: 700 } } as SxProps<Theme>,

    sidebarContainer: { position: 'sticky', top: 24 } as SxProps<Theme>,
    sidebarPaper: { p: 3, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3, bgcolor:'white', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' } as SxProps<Theme>
};