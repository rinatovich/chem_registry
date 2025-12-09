import { useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Button, Grid, Paper, Stack,
    Card, CardContent, Chip, Divider
} from '@mui/material';
import {
    Search, Login, MenuBook, Security, Gavel,
    BarChart, Science
} from '@mui/icons-material';
import { StatisticsSection } from './StatisticsSection';
import { SupportFab } from './components/SupportFab';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>

            {/* ==================================================================================
                1. HERO SECTION (ШАПКА)
               ================================================================================== */}
            <Box sx={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
                color: 'white',
                pt: 2,
                pb: { xs: 12, md: 20 }, // Чуть меньше отступ снизу
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{ position: 'absolute', top: -150, right: -100, width: 600, height: 600, borderRadius: '50%', bgcolor: 'rgba(59, 130, 246, 0.15)', filter: 'blur(80px)' }} />
                <Box sx={{ position: 'absolute', bottom: 0, left: -100, width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(59, 130, 246, 0.1)', filter: 'blur(60px)' }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>

                    {/* НАВИГАЦИЯ */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" py={3} mb={6}>
                        <Box display="flex" alignItems="center" gap={2} sx={{ cursor: 'pointer' }} onClick={() => window.location.reload()}>
                            <Box sx={{
                                width: 40, height: 40, bgcolor: 'white', borderRadius: 2,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#0f172a', fontWeight: '900', fontSize: 16
                            }}>
                                UZ
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" fontWeight="800" lineHeight={1.1} color="white">
                                    НАЦИОНАЛЬНЫЙ<br/>РЕЕСТР
                                </Typography>
                            </Box>
                        </Box>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Button
                                color="inherit"
                                onClick={() => navigate('/login')}
                                sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500, fontSize: '0.9rem' }}
                            >
                                Вход для сотрудников
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                color="primary"
                                startIcon={<Login />}
                                onClick={() => navigate('/login')}
                                sx={{
                                    borderRadius: 50, px: 3,
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                                }}
                            >
                                Личный кабинет
                            </Button>
                        </Stack>
                    </Box>

                    {/* ГЛАВНЫЙ БЛОК */}
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <Chip
                                label="Государственная информационная система"
                                size="small"
                                sx={{ bgcolor: 'rgba(96, 165, 250, 0.2)', color: '#93c5fd', fontWeight: 600, mb: 3, border: '1px solid rgba(96, 165, 250, 0.3)' }}
                            />
                            <Typography variant="h2" fontWeight="800" sx={{ mb: 3, lineHeight: 1.1, fontSize: { xs: '2.5rem', md: '3.5rem' }, color: 'white' }}>
                                Единый учет химической продукции
                            </Typography>
                            <Typography variant="h6" sx={{ mb: 5, opacity: 0.85, fontWeight: 400, maxWidth: 550, color: '#e2e8f0', lineHeight: 1.6, fontSize: '1.1rem' }}>
                                Регистрация, паспортизация и контроль оборота опасных химических веществ на территории Республики Узбекистан.
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/registry')}
                                    startIcon={<Search />}
                                    sx={{
                                        py: 1.5, px: 4, borderRadius: 2,
                                        fontSize: '1rem', fontWeight: 'bold',
                                        bgcolor: '#3b82f6', color: 'white',
                                        boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.5)',
                                        '&:hover': { bgcolor: '#2563eb' }
                                    }}
                                >
                                    Поиск в Реестре
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => navigate('/statistics')}
                                    startIcon={<BarChart />}
                                    sx={{
                                        py: 1.5, px: 4, borderRadius: 2,
                                        fontSize: '1rem', color: 'white',
                                        borderColor: 'rgba(255,255,255,0.3)',
                                        '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
                                    }}
                                >
                                    Статистика
                                </Button>
                            </Stack>
                        </Grid>

                        {/* ПРАВАЯ ЧАСТЬ (Инфо-блок) */}
                        <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Paper sx={{
                                bgcolor: 'rgba(30, 41, 59, 0.7)', // Темнее фон для контраста
                                backdropFilter: 'blur(12px)',
                                borderRadius: 3,
                                border: '1px solid rgba(255,255,255,0.1)',
                                overflow: 'hidden',
                                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)'
                            }}>
                                <Box p={2.5} borderBottom="1px solid rgba(255,255,255,0.1)">
                                    <Typography variant="subtitle2" fontWeight="bold" color="white" letterSpacing={1}>КЛЮЧЕВЫЕ ЗАДАЧИ</Typography>
                                </Box>
                                <Stack spacing={0}>
                                    <InfoItem icon={<Security sx={{ color: '#4ade80' }} />} title="Безопасность" text="Мониторинг оборота опасных веществ" />
                                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                                    <InfoItem icon={<MenuBook sx={{ color: '#60a5fa' }} />} title="Стандартизация" text="Единый формат паспортов (GHS/ГОСТ)" />
                                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                                    <InfoItem icon={<Gavel sx={{ color: '#facc15' }} />} title="Регулирование" text="Соответствие законодательству РУз" />
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* ==================================================================================
                2. БЛОК СТАТИСТИКИ (ПЛАВАЮЩИЙ)
               ================================================================================== */}
            <Container maxWidth="lg" sx={{ mt: -10, position: 'relative', zIndex: 10, mb: 12 }}>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: 4,
                        // Красивая глубокая тень
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                        bgcolor: 'white',
                        border: '1px solid rgba(0,0,0,0.05)',
                        overflow: 'hidden'
                    }}
                >
                    <StatisticsSection />
                </Paper>
            </Container>

            {/* ==================================================================================
                3. ВОЗМОЖНОСТИ (КАРТОЧКИ В РЯД)
               ================================================================================== */}
            <Container maxWidth="lg" sx={{ mb: 12 }}>
                <Box textAlign="center" mb={6}>
                    <Typography variant="overline" color="primary" fontWeight="bold" letterSpacing={2}>
                        ВОЗМОЖНОСТИ СИСТЕМЫ
                    </Typography>
                    <Typography variant="h3" fontWeight="800" color="#1e293b" mt={1}>
                        Единое цифровое пространство
                    </Typography>
                </Box>

                {/* Grid container с spacing 4. Карточки будут 4 колонки шириной на десктопе (md={4}) */}
                <Grid container spacing={4} alignItems="stretch">
                    <FeatureCard
                        title="Открытый реестр"
                        desc="Доступ к актуальной базе данных химических веществ, прошедших государственную регистрацию."
                        icon={<Search fontSize="large" color="primary" />}
                    />
                    <FeatureCard
                        title="Генерация Паспортов"
                        desc="Автоматическое формирование Паспортов безопасности химической продукции по ГОСТ 30333-2007."
                        icon={<MenuBook fontSize="large" color="secondary" />}
                    />
                    <FeatureCard
                        title="Классификация GHS"
                        desc="Автоматическое определение класса опасности и маркировки в соответствии с СГС (GHS)."
                        icon={<Science fontSize="large" color="warning" />}
                    />
                </Grid>
            </Container>

            {/* ==================================================================================
                4. ЭТАПЫ РАБОТЫ (СЕРЫЙ ФОН)
               ================================================================================== */}
            <Box sx={{ bgcolor: '#f8fafc', py: 10 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        {/* Левая колонка - Текст */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h4" fontWeight="800" color="#1e293b" mb={4}>
                                Порядок регистрации вещества
                            </Typography>
                            <Stack spacing={3}>
                                <StepItem num="1" title="Подача заявки" text="Производитель или импортер подает заявку через личный кабинет, указывая состав и свойства вещества." />
                                <StepItem num="2" title="Экспертиза" text="Специалисты проверяют корректность данных, классификацию опасности и меры безопасности." />
                                <StepItem num="3" title="Внесение в реестр" text="Веществу присваивается уникальный номер, и оно публикуется в открытом доступе." />
                            </Stack>
                        </Grid>

                        {/* Правая колонка - CTA Карточка */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{
                                height: 380,
                                borderRadius: 4,
                                border: '1px solid #e2e8f0',
                                bgcolor: 'white',
                                display: 'flex',
                                flexDirection: 'column', // ВАЖНО: Колонка
                                justifyContent: 'center', // Центрируем по вертикали
                                alignItems: 'center', // Центрируем по горизонтали
                                background: 'radial-gradient(circle at top right, #f1f5f9, white)',
                                position: 'relative',
                                overflow: 'hidden',
                                p: 4
                            }}>
                                {/* Фоновая иконка */}
                                <Science sx={{ fontSize: 180, color: '#f1f5f9', position: 'absolute', top: -20, right: -20, opacity: 0.8 }} />

                                <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                                    <Typography variant="h5" fontWeight="800" color="#1e293b" gutterBottom>
                                        Начните работу<br/>прямо сейчас
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                        Зарегистрируйте организацию и получите<br/>доступ к кабинету
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={() => navigate('/login')}
                                        sx={{ borderRadius: 2, px: 4, py: 1.5, fontWeight: 'bold' }}
                                    >
                                        Войти в систему
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* 5. ФУТЕР */}
            <Box sx={{ bgcolor: '#0f172a', color: '#94a3b8', py: 8, mt: 'auto' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                                <Box sx={{ width: 32, height: 32, bgcolor: 'white', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontWeight: 'bold' }}>UZ</Box>
                                <Typography variant="h6" fontWeight="bold" color="white">НРОХВ</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ maxWidth: 300, lineHeight: 1.6 }}>
                                Государственная система учета и контроля опасных химических веществ Республики Узбекистан.
                            </Typography>
                        </Grid>
                        <Grid item xs={6} md={4}>
                            <Typography variant="subtitle2" fontWeight="bold" color="white" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>Навигация</Typography>
                            <Stack spacing={1.5}>
                                <LinkItem onClick={() => navigate('/registry')}>Реестр веществ</LinkItem>
                                <LinkItem onClick={() => navigate('/statistics')}>Аналитика</LinkItem>
                                <LinkItem onClick={() => navigate('/login')}>Кабинет партнера</LinkItem>
                            </Stack>
                        </Grid>
                        <Grid item xs={6} md={4}>
                            <Typography variant="subtitle2" fontWeight="bold" color="white" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 2 }}>Помощь</Typography>
                            <Stack spacing={1.5}>
                                <Box>
                                    <Typography variant="caption" display="block">Техподдержка:</Typography>
                                    <Typography variant="body2" color="white" fontWeight="500">support@chem-registry.uz</Typography>
                                </Box>
                                <Typography variant="caption" sx={{ display: 'block' }}>Пн-Пт, 09:00 - 18:00</Typography>
                            </Stack>
                        </Grid>
                    </Grid>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 4 }} />
                    <Typography variant="body2" align="center" sx={{ opacity: 0.5 }}>
                        © 2025 Национальный Реестр ОХВ. Все права защищены.
                    </Typography>
                </Container>
            </Box>

            <SupportFab />
        </Box>
    );
};

// --- КОМПОНЕНТЫ ---

const InfoItem = ({ icon, title, text }: any) => (
    <Box display="flex" alignItems="center" gap={2} p={2} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }, transition: '0.2s' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>{icon}</Box>
        <Box>
            <Typography variant="body2" fontWeight="bold" color="white">{title}</Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>{text}</Typography>
        </Box>
    </Box>
);

// Исправлено: добавлено md={4} для правильной сетки
const FeatureCard = ({ title, desc, icon }: any) => (
    <Grid item xs={12} md={4}>
        <Card elevation={0} sx={{
            height: '100%',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            transition: '0.3s',
            display: 'flex', flexDirection: 'column',
            '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 15px 30px -10px rgba(0,0,0,0.08)' }
        }}>
            <CardContent sx={{ p: 4, flexGrow: 1 }}>
                <Box sx={{ mb: 3, p: 2, bgcolor: '#f1f5f9', borderRadius: 3, width: 'fit-content' }}>
                    {icon}
                </Box>
                <Typography variant="h6" fontWeight="800" gutterBottom color="#1e293b">{title}</Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>{desc}</Typography>
            </CardContent>
        </Card>
    </Grid>
);

const StepItem = ({ num, title, text }: any) => (
    <Box display="flex" gap={3}>
        <Box sx={{
            width: 48, height: 48, flexShrink: 0,
            borderRadius: '50%', bgcolor: '#ffffff', color: '#3b82f6',
            border: '2px solid #3b82f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '1.2rem'
        }}>
            {num}
        </Box>
        <Box pt={0.5}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="#1e293b">{title}</Typography>
            <Typography variant="body2" color="text.secondary" lineHeight={1.6}>{text}</Typography>
        </Box>
    </Box>
);

const LinkItem = ({ children, onClick }: any) => (
    <Typography
        variant="body2"
        onClick={onClick}
        sx={{ cursor: 'pointer', transition: '0.2s', '&:hover': { color: 'white', transform: 'translateX(5px)' } }}
    >
        {children}
    </Typography>
);

export default HomePage;