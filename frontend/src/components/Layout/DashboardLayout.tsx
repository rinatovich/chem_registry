import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box, AppBar, Toolbar, Typography, IconButton, Drawer,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Divider, Avatar, Menu, MenuItem, CircularProgress
} from '@mui/material';
import {
    Menu as MenuIcon,
    Science,
    CloudUpload,
    Dashboard,
    Business, // Иконка Офиса
    Logout,
    Person
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../../api/auth';

const DRAWER_WIDTH = 280;

const DashboardLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Загружаем профиль
    const { data: userProfile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
        staleTime: 1000 * 60 * 5
    });

    const menuItems = [
        { text: 'Мои Вещества', icon: <Science />, path: '/dashboard/elements' },
        { text: 'Импорт Excel', icon: <CloudUpload />, path: '/dashboard/import' },
        // Добавлен пункт профиля
        { text: 'Об организации', icon: <Business />, path: '/dashboard/profile' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatRole = (user: any) => {
        if (!user?.company) return user?.role;
        const roles = [];
        if (user.company.is_manufacturer) roles.push('Производитель');
        if (user.company.is_importer) roles.push('Импортер');
        if (roles.length === 0) return "Поставщик";
        return roles.join(' / ');
    };

    const drawerContent = (
        <div>
            <Toolbar sx={{ bgcolor: '#1e3a8a', color: 'white', display:'flex', gap:1 }}>
                <Dashboard />
                <Typography variant="subtitle1" fontWeight="bold">КАБИНЕТ</Typography>
            </Toolbar>
            <Divider />
            <List sx={{ pt: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                            sx={{
                                borderRadius: '0 50px 50px 0',
                                mr: 2, pl: 3,
                                '&.Mui-selected': {
                                    bgcolor: '#e3f2fd', color: '#1565c0', borderLeft: '4px solid #1565c0',
                                    '& .MuiListItemIcon-root': { color: '#1565c0' }
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? 'inherit' : 'grey.600' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
            {/* Хедер */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: '#2563eb' }} elevation={0}>
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: 'none' } }}>
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight:'bold' }}>
                        Национальный Реестр ОХВ
                    </Typography>

                    {/* Правая часть: Пользователь */}
                    <Box display="flex" alignItems="center" gap={2}>
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : (
                            <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
                                <Typography variant="body2" fontWeight="bold">
                                    {userProfile?.company?.company_name || userProfile?.username}
                                </Typography>
                                <Typography variant="caption" sx={{ bgcolor: 'rgba(255,255,255,0.2)', px: 1, borderRadius: 1 }}>
                                    {formatRole(userProfile)}
                                </Typography>
                            </Box>
                        )}

                        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
                            <Avatar sx={{ bgcolor: 'white', color: 'primary.main' }}>
                                <Person />
                            </Avatar>
                        </IconButton>
                    </Box>

                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                            Выйти
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Боковое меню */}
            <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}
                >
                    {drawerContent}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: 'none' } }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Контент */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default DashboardLayout;