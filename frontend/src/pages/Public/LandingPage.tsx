import { useState } from 'react';
import {
    Container, Box, Typography, Paper,
    Button, InputBase, IconButton, Divider, Grid
} from '@mui/material';
import { Search, Login, Description, Clear, BarChart } from '@mui/icons-material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { downloadPassport } from '../../api/registry';
import { useDebounce } from '../../hooks/useDebounce';
import { FilterSidebar } from './components/FilterSidebar';
import { SupportFab } from './components/SupportFab';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';

// --- Хелпер для подсветки текста ---
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
                        fontWeight: part.highlight ? 800 : 400,
                        color: part.highlight ? '#1565c0' : 'inherit',
                        backgroundColor: part.highlight ? '#e3f2fd' : 'transparent',
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

    // 1. ПОИСК
    const [inputValue, setInputValue] = useState('');
    const searchTerm = useDebounce(inputValue, 400);

    // 2. ФИЛЬТРЫ
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

    const handleFilterChange = (key: string, value: string | null) => {
        setActiveFilters(prev => {
            const next = { ...prev };
            if (value === null) delete next[key];
            else next[key] = value;
            return next;
        });
    };

    // 3. ЗАГРУЗКА ДАННЫХ
    const { data: rowsData, isLoading } = useQuery({
        queryKey: ['public-data', searchTerm, activeFilters],
        queryFn: async () => {
            const params: any = { ...activeFilters };
            if (searchTerm) params.search = searchTerm;
            else params.ordering = '-updated_at';
            const res = await client.get('/registry/elements/', { params });
            return res.data;
        },
        staleTime: 1000 * 60 * 2,
    });

    // 4. ЗАГРУЗКА ФАСЕТОВ
    const { data: facetsData, isLoading: isFacetsLoading } = useQuery({
        queryKey: ['facets', searchTerm],
        queryFn: async () => {
            const params: any = {};
            if (searchTerm) params.search = searchTerm;
            const res = await client.get('/registry/elements/facets/', { params });
            return res.data;
        },
        retry: false
    });

    // 5. КОЛОНКИ
    const { data: configColumns } = useQuery({
        queryKey: ['public-config'],
        queryFn: async () => {
            const res = await client.get<RegistryColumn[]>('/registry/config/');
            return res.data;
        },
        staleTime: 1000 * 60 * 30,
    });

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        ...(configColumns || []).map(col => ({
            field: col.field, headerName: col.headerName, minWidth: 150, flex: 1,
            renderCell: (params: GridRenderCellParams) => {
                const value = params.value ? String(params.value) : '';
                if (col.field === 'primary_name_ru' || col.field === 'primary_name') {
                    return (
                        <span
                            style={{ cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                            onClick={(e) => { e.stopPropagation(); navigate(`/public/${params.row.id}`); }}
                        >
                            <HighlightedText text={value} query={searchTerm} />
                        </span>
                    );
                }
                return <HighlightedText text={value} query={searchTerm} />;
            }
        })),
        { field: 'actions', headerName: 'Документ', width: 140, sortable: false, renderCell: (params) => (
                <Button size="small" onClick={() => downloadPassport(params.row.id)}>Паспорт</Button>
            )}
    ];

    const rows = (rowsData?.results || []).map((item: any) => {
        const flatItem = { ...item };
        Object.keys(item).forEach(key => {
            if (typeof item[key] === 'object' && item[key] !== null && key.startsWith('sec')) {
                Object.assign(flatItem, item[key]);
            }
        });
        return flatItem;
    });

    // Логика отображения сайдбара (показывать если грузится ИЛИ есть данные)
    const showSidebar = isFacetsLoading || (facetsData && Object.keys(facetsData).length > 0);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>

            {/* ГЕРОЙ */}
            <Box sx={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: 'white', pb: 12 }}>
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, mb: 6 }}>
                        <Box sx={{ display:'flex', alignItems:'center', gap: 2 }}>
                            <Box sx={{ p: 1, bgcolor:'white', borderRadius:'50%', color: '#1e3a8a', fontWeight:'bold', width: 40, height: 40, display: 'flex', justifyContent:'center', alignItems:'center' }}>UZ</Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>НАЦИОНАЛЬНЫЙ РЕЕСТР</Typography>
                        </Box>

                        <Box display="flex" gap={2}>
                            <Button
                                color="inherit"
                                startIcon={<BarChart />}
                                onClick={() => navigate('/statistics')}
                                sx={{ borderRadius: 20, textTransform: 'none', fontWeight: 500, opacity: 0.9, '&:hover': { opacity: 1, bgcolor: 'rgba(255,255,255,0.1)' } }}
                            >
                                Статистика
                            </Button>
                            <SupportFab />
                            <Button
                                variant="outlined"
                                color="inherit"
                                startIcon={<Login />}
                                onClick={() => navigate('/login')}
                                sx={{ borderRadius: 20, textTransform: 'none', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
                            >
                                Кабинет
                            </Button>
                        </Box>
                    </Box>

                    <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
                        <Typography variant="h3" fontWeight="800" sx={{ mb: 4, lineHeight: 1.2 }}>
                            Электронная база данных<br/>химических элементов
                        </Typography>

                        {/* ПОИСК */}
                        <Paper sx={{ p: '4px', display: 'flex', alignItems: 'center', borderRadius: 50, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', bgcolor: 'white', height: 60 }}>
                            <Box sx={{ pl: 2, display: 'flex', alignItems: 'center', flex: 1 }}>
                                <Search sx={{ color: '#1e3a8a', fontSize: 26, mr: 1 }} />
                                <InputBase
                                    sx={{ flex: 1, fontSize: '1.1rem' }}
                                    placeholder="Название, CAS номер или формулу..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                />
                                {inputValue && (
                                    <>
                                        <IconButton size="small" onClick={() => setInputValue('')} sx={{ mr: 1 }}><Clear/></IconButton>
                                        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                                    </>
                                )}
                            </Box>
                            <Button variant="contained" size="large" sx={{ borderRadius: 30, px: 4, height: '100%', boxShadow: 'none' }}>
                                Найти
                            </Button>
                        </Paper>
                    </Box>
                </Container>
            </Box>

            {/* КОНТЕНТ */}
            <Container maxWidth="xl" sx={{ mt: -8, mb: 10, flexGrow: 1, position: 'relative', zIndex: 2 }}>
                <Grid container spacing={3}>

                    {/* ЛЕВАЯ КОЛОНКА (Сайдбар) */}
                    {showSidebar && (
                        <Grid item xs={12} md={3} lg={2.5} sx={{ minWidth: 0 }}>
                            <Box sx={{ position: 'sticky', top: 24 }}>
                                <FilterSidebar
                                    data={facetsData}
                                    isLoading={isFacetsLoading}
                                    activeFilters={activeFilters}
                                    onFilterChange={handleFilterChange}
                                />
                            </Box>
                        </Grid>
                    )}

                    {/* ПРАВАЯ КОЛОНКА (Таблица) */}
                    <Grid item xs={12} md={showSidebar ? 9 : 12} lg={showSidebar ? 9.5 : 12} sx={{ minWidth: 0 }}>
                        <Paper sx={{ height: 700, width: '100%', borderRadius: 4, overflow: 'hidden', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}>
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                // ИСПОЛЬЗУЕМ ВСТРОЕННЫЙ LOADER
                                loading={isLoading}
                                disableRowSelectionOnClick
                                initialState={{ pagination: { paginationModel: { pageSize: 15 } } }}
                                pageSizeOptions={[15, 30]}
                                slots={{ toolbar: GridToolbar }}
                                slotProps={{ toolbar: { showQuickFilter: false, printOptions: { disableToolbarButton: true } } }}
                                sx={{
                                    border: 'none',
                                    '& .MuiDataGrid-columnHeaders': { bgcolor: '#f1f5f9', fontWeight: 'bold', textTransform: 'uppercase', color: '#475569', fontSize: '0.8rem' },
                                    '& .MuiDataGrid-cell': { fontSize: '14px', borderBottom: '1px solid #f1f5f9' }
                                }}
                            />
                        </Paper>
                    </Grid>

                </Grid>
            </Container>
        </Box>
    );
};

export default LandingPage;