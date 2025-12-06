import { useState } from 'react';
import {
    Container, Box, Typography, Paper, InputBase, IconButton,
    Button, LinearProgress
} from '@mui/material';
import { Search, Login, Description } from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { downloadPassport } from '../../api/registry';
import { useDebounce } from '../../hooks/useDebounce';

// Библиотеки для подсветки текста (мы их уже ставили)
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';

// --- 0. МИНИ-КОМПОНЕНТ ПОДСВЕТКИ ---
// Принимает текст и поисковый запрос, возвращает HTML с жирным шрифтом
const HighlightedText = ({ text, query }: { text: string, query: string }) => {
    if (!text) return null;
    if (!query) return <span>{text}</span>;

    const matches = match(text, query);
    const parts = parse(text, matches);

    return (
        <span>
            {parts.map((part, index) => (
                <span
                    key={index}
                    style={{
                        // Если совпало: Жирный + Синий цвет, Иначе: Обычный
                        fontWeight: part.highlight ? 800 : 400,
                        color: part.highlight ? '#1565c0' : 'inherit',
                        backgroundColor: part.highlight ? '#e3f2fd' : 'transparent', // Легкий фон
                    }}
                >
                    {part.text}
                </span>
            ))}
        </span>
    );
};

interface RegistryColumn {
    field: string;
    headerName: string;
    minWidth: number;
}

const LandingPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 400); // 400мс задержка

    // 1. КОНФИГ
    const { data: configColumns } = useQuery({
        queryKey: ['public-config'],
        queryFn: async () => {
            const res = await client.get<RegistryColumn[]>('/registry/config/');
            return res.data;
        },
        staleTime: 1000 * 60 * 30,
    });

    // 2. ДАННЫЕ
    const { data: rowsData, isLoading } = useQuery({
        queryKey: ['public-data', debouncedSearch],
        queryFn: async () => {
            const params: any = {};
            if (debouncedSearch) params.search = debouncedSearch;
            else params.ordering = '-updated_at';

            const res = await client.get('/registry/elements/', { params });
            return res.data;
        }
    });

    // 3. КОЛОНКИ
    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },

        ...(configColumns || []).map(col => {
            const def: GridColDef = {
                field: col.field,
                headerName: col.headerName,
                minWidth: col.minWidth || 150,
                flex: 1,
            };

            // КАСТОМНЫЙ РЕНДЕР: ССЫЛКА + ПОДСВЕТКА
            // Применяем ко всем текстовым полям, чтобы подсвечивало и CAS тоже
            def.renderCell = (params: GridRenderCellParams) => {
                const value = params.value ? String(params.value) : '';

                // Особый стиль для Главного названия (Ссылка)
                if (col.field === 'primary_name_ru' || col.field === 'primary_name') {
                    return (
                        <span
                            style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/public/${params.row.id}`);
                            }}
                        >
                            {/* Вставляем компонент подсветки */}
                            <HighlightedText text={value} query={debouncedSearch} />
                        </span>
                    );
                }

                // Для обычных колонок (например, CAS) тоже делаем подсветку, но без ссылки
                return <HighlightedText text={value} query={debouncedSearch} />;
            };

            return def;
        }),

        {
            field: 'actions',
            headerName: 'Документ',
            width: 140,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Button
                    size="small" variant="outlined" startIcon={<Description />}
                    onClick={() => downloadPassport(params.row.id)}
                    sx={{ fontSize: 11, borderRadius: 20, py: 0.5 }}
                >
                    Паспорт
                </Button>
            )
        }
    ];

    // 4. DATA PREPARATION
    const rows = (rowsData?.results || []).map((item: any) => {
        const flatItem = { ...item };
        Object.keys(item).forEach(key => {
            if (typeof item[key] === 'object' && item[key] !== null && key.startsWith('sec')) {
                Object.assign(flatItem, item[key]);
            }
        });
        return flatItem;
    });

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

            {/* ГЕРОЙ */}
            <Box sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: 'white', pb: 12 }}>
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, mb: 3 }}>
                        <Box sx={{ display:'flex', alignItems:'center', gap: 2 }}>
                            <Box sx={{ p: 1, bgcolor:'white', borderRadius:'50%', color: '#1e3a8a', fontWeight:'bold', width: 40, height: 40, display: 'flex', justifyContent:'center', alignItems:'center' }}>UZ</Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>НАЦИОНАЛЬНЫЙ РЕЕСТР</Typography>
                        </Box>
                        <Button variant="outlined" color="inherit" startIcon={<Login />} onClick={() => navigate('/login')} sx={{ borderRadius: 20, textTransform: 'none', borderColor: 'rgba(255,255,255,0.3)' }}>
                            Кабинет
                        </Button>
                    </Box>

                    <Box sx={{ textAlign: 'center', maxWidth: '700px', mx: 'auto' }}>
                        <Typography variant="h3" fontWeight="800" sx={{ mb: 4 }}>Электронная база данных химических элементов</Typography>
                        <Paper sx={{ p: '8px 16px', display: 'flex', alignItems: 'center', borderRadius: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                            <InputBase
                                sx={{ ml: 2, flex: 1, fontSize: '18px' }}
                                placeholder="Введите запрос..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <IconButton color="primary" sx={{ p: '10px' }}><Search /></IconButton>
                        </Paper>
                    </Box>
                </Container>
            </Box>

            {/* ТАБЛИЦА */}
            <Container maxWidth="xl" sx={{ mt: -8, mb: 10, flexGrow: 1, position: 'relative', zIndex: 2 }}>
                <Paper sx={{ height: 700, width: '100%', borderRadius: 4, overflow: 'hidden', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}>
                    {isLoading ? <LinearProgress /> : (
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            disableRowSelectionOnClick
                            initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
                            pageSizeOptions={[15, 30]}
                            slots={{ toolbar: GridToolbar }}
                            slotProps={{
                                toolbar: { showQuickFilter: false, printOptions: { disableToolbarButton: true } }
                            }}
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': { bgcolor: '#f1f5f9', fontWeight: 'bold', textTransform: 'uppercase', color: '#475569' },
                                '& .MuiDataGrid-cell': { fontSize: '14px' }
                            }}
                        />
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default LandingPage;