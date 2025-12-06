import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';

// Импортируем наш AuthProvider (убедитесь, что файл context/AuthContext.tsx существует)
import { AuthProvider } from './context/AuthContext';

import App from './App.tsx'
import theme from './theme';
// import './index.css' // Раскомментируйте, если файл index.css существует

// Шрифты
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Клиент для кэширования запросов
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider> {/* Провайдер авторизации */}
                <ThemeProvider theme={theme}> {/* Провайдер темы */}
                    <CssBaseline />
                    {/* Провайдер уведомлений - без троеточия, с настройками */}
                    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                        <BrowserRouter>
                            <App />
                        </BrowserRouter>
                    </SnackbarProvider>
                </ThemeProvider>
            </AuthProvider>
        </QueryClientProvider>
    </React.StrictMode>,
)