import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

// Страницы и Компоненты
import LoginPage from './pages/Auth/LoginPage';
import DashboardLayout from './components/Layout/DashboardLayout';
import SubstancesList from './pages/Dashboard/SubstancesList';
import ImportPage from './pages/Dashboard/ImportPage'; // <--- НОВАЯ СТРАНИЦА
import ElementPage from './pages/Dashboard/ElementPage';
// Контекст
import { useAuth } from './context/AuthContext';
import LandingPage from "./pages/Public/LandingPage.tsx";
import PublicElementPage from './pages/Public/PublicElementPage';
import RegisterPage from './pages/Auth/RegisterPage';
import OrganizationPage from './pages/Dashboard/OrganizationPage';
/**
 * Компонент-обертка для защиты приватных маршрутов.
 * Если пользователь не авторизован — перекидывает на логин.
 */
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated } = useAuth();

    // Здесь можно добавить проверку isLoading, если проверка токена идет асинхронно
    // Но для localStorage это происходит мгновенно
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Routes>
            {/* 1. ПУБЛИЧНЫЕ МАРШРУТЫ */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/public/:id" element={<PublicElementPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 2. ЗАЩИЩЕННЫЕ МАРШРУТЫ (КАБИНЕТ) */}
            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <DashboardLayout /> {/* Общая рамка с меню и шапкой */}
                    </PrivateRoute>
                }
            >
                {/* Редирект по умолчанию на список */}
                <Route index element={<Navigate to="elements" replace />} />
                <Route path="elements/new" element={<ElementPage />} />
                {/* Список веществ */}
                <Route path="elements" element={<SubstancesList />} />
                <Route path="elements/:id" element={<ElementPage />} />
                {/* Мастер Импорта (НОВОЕ) */}
                <Route path="import" element={<ImportPage />} />
                <Route path="profile" element={<OrganizationPage />} />
            </Route>

            {/* 3. ОБРАБОТКА 404 (Опционально) */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
}

export default App;