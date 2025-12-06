import { createTheme } from '@mui/material/styles';

// Палитра государственных сайтов (примерно my.gov.uz / tax.uz)
const GOV_BLUE = '#2563EB'; // Современный государственный синий
const GOV_DARK = '#1E3A8A'; // Темно-синий для шапок
const GOV_GREEN = '#10B981'; // Зеленый для успешных операций (флаг)

const theme = createTheme({
    palette: {
        primary: {
            main: GOV_BLUE,
            dark: GOV_DARK,
            contrastText: '#ffffff',
        },
        secondary: {
            main: GOV_GREEN,
        },
        background: {
            default: '#F3F6F9', // Светло-серый фон
            paper: '#FFFFFF',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontSize: '2.5rem', fontWeight: 700, color: GOV_DARK },
        h2: { fontSize: '2rem', fontWeight: 600, color: GOV_DARK },
        button: { textTransform: 'none', fontWeight: 500 }, // Убираем капс у кнопок
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8, // Скругленные углы
                    boxShadow: 'none',
                    '&:hover': { boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: `linear-gradient(90deg, ${GOV_DARK} 0%, ${GOV_BLUE} 100%)`,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                },
            },
        },
    },
});

export default theme;