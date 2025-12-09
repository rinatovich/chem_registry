import { Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

// Страницы
import HomePage from './pages/Public/HomePage'; // <--- НОВЫЙ ИМПОРТ
import LandingPage from './pages/Public/LandingPage'; // Это теперь страница "Реестр"
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import PublicElementPage from './pages/Public/PublicElementPage';
import StatisticsPage from './pages/Public/StatisticsPage';

// Dashboard
import DashboardLayout from './components/Layout/DashboardLayout';
import SubstancesList from './pages/Dashboard/SubstancesList';
import ElementPage from './pages/Dashboard/ElementPage';
import ImportPage from './pages/Dashboard/ImportPage';
import OrganizationPage from './pages/Dashboard/OrganizationPage';

// Context
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Routes>
            {/* 1. ПУБЛИЧНЫЕ МАРШРУТЫ */}
            <Route path="/" element={<HomePage />} />          {/* <--- ГЛАВНАЯ */}
            <Route path="/registry" element={<LandingPage />} /> {/* <--- РЕЕСТР (БЫВШИЙ ЛЕНДИНГ) */}

            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/public/:id" element={<PublicElementPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 2. КАБИНЕТ */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                <Route index element={<Navigate to="elements" replace />} />
                <Route path="elements" element={<SubstancesList />} />
                <Route path="elements/new" element={<ElementPage />} />
                <Route path="elements/:id" element={<ElementPage />} />
                <Route path="import" element={<ImportPage />} />
                <Route path="profile" element={<OrganizationPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default App;