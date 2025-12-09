import { useQuery } from '@tanstack/react-query';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import {
    Paper, Typography, Box, Chip, Button, CircularProgress,
    Alert, IconButton, Tooltip, Stack, Divider
} from '@mui/material';
import {
    Add, Edit, CloudUpload, Science, Warning, CheckCircle,
    Cancel, Schedule, Drafts
} from '@mui/icons-material';
import { getMyElements } from '../../api/registry';
import { useNavigate } from 'react-router-dom';

const SubstancesList = () => {
    const navigate = useNavigate();

    // Запрос данных
    const { data, isLoading, error } = useQuery({
        queryKey: ['my-elements'],
        queryFn: getMyElements,
    });

    // --- КОЛОНКИ ТАБЛИЦЫ ---
    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 70,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => <Typography variant="caption" color="text.secondary">#{params.value}</Typography>
        },
        {
            field: 'primary_name_ru',
            headerName: 'Название вещества',
            flex: 2, // Берет больше места
            minWidth: 250,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        p: 0.5, borderRadius: 1, bgcolor: '#e3f2fd', color: '#1976d2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Science fontSize="small" />
                    </Box>
                    <Box>
                        <Typography variant="body2" fontWeight="600" lineHeight={1.2}>
                            {params.value}
                        </Typography>
                        {/* Если есть синонимы или англ название, можно вывести тут мелким шрифтом */}
                    </Box>
                </Box>
            )
        },
        {
            field: 'cas_number',
            headerName: 'CAS Номер',
            width: 140,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500, bgcolor: '#f8f9fa', px: 1, borderRadius: 1 }}>
                    {params.value || '—'}
                </Typography>
            )
        },
        // НОВАЯ КОЛОНКА
        {
            field: 'hazard_class',
            headerName: 'Класс опасности',
            width: 160,
            renderCell: (params) => {
                if (!params.value || params.value === 'Не классифицируется') return <Typography variant="caption" color="text.disabled">—</Typography>;
                return (
                    <Chip
                        label={params.value}
                        size="small"
                        sx={{
                            height: 24,
                            fontSize: '0.75rem',
                            bgcolor: '#fff3e0', color: '#e65100', fontWeight: 600
                        }}
                    />
                );
            }
        },
        {
            field: 'updated_at',
            headerName: 'Обновлено',
            width: 140,
            valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '—'
        },
        {
            field: 'status',
            headerName: 'Статус',
            width: 160,
            renderCell: (params: GridRenderCellParams) => {
                let color = "#e0e0e0";
                let bg = "#f5f5f5";
                let icon = <Drafts style={{fontSize: 16}} />;
                let label = "Черновик";

                switch (params.value) {
                    case 'DRAFT':
                        label="Черновик"; color="#64748b"; bg="#f1f5f9"; icon=<Drafts style={{fontSize: 14}}/>;
                        break;
                    case 'PENDING':
                        label="На проверке"; color="#d97706"; bg="#fffbeb"; icon=<Schedule style={{fontSize: 14}}/>;
                        break;
                    case 'PUBLISHED':
                        label="Опубликовано"; color="#059669"; bg="#ecfdf5"; icon=<CheckCircle style={{fontSize: 14}}/>;
                        break;
                    case 'REJECTED':
                        label="Отклонено"; color="#dc2626"; bg="#fef2f2"; icon=<Cancel style={{fontSize: 14}}/>;
                        break;
                }

                return (
                    <Chip
                        icon={icon}
                        label={label}
                        size="small"
                        sx={{
                            bgcolor: bg, color: color, fontWeight: 700, border: '1px solid', borderColor: 'transparent',
                            '& .MuiChip-icon': { color: 'inherit' }
                        }}
                    />
                );
            },
        },
        {
            field: 'actions',
            headerName: '',
            width: 60,
            align: 'right',
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Tooltip title="Редактировать">
                    <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/elements/${params.row.id}`); }}
                        sx={{ color: '#94a3b8', '&:hover': { color: '#2563eb', bgcolor: '#eff6ff' } }}
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    if (isLoading) return <Box sx={{ display:'flex', justifyContent:'center', mt:10 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">Не удалось загрузить список веществ.</Alert>;

    return (
        <Box>
            {/* --- ЗАГОЛОВОК СТРАНИЦЫ --- */}
            <Paper
                elevation={0}
                sx={{
                    p: 3, mb: 3, borderRadius: 3,
                    border: '1px solid #e2e8f0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2,
                    background: 'linear-gradient(to right, #ffffff, #f8fafc)'
                }}
            >
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 0.5 }}>
                        Мои Вещества
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Управление паспортами безопасности и статусами
                    </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        color="success" // Зеленая кнопка для основного действия
                        startIcon={<Add />}
                        onClick={() => navigate('/dashboard/elements/new')}
                        sx={{
                            borderRadius: 2, textTransform: 'none', fontWeight: 600,
                            px: 3, py: 1, boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
                        }}
                    >
                        Создать вручную
                    </Button>

                    <Divider orientation="vertical" flexItem />

                    <Button
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        onClick={() => navigate('/dashboard/import')}
                        sx={{
                            borderRadius: 2, textTransform: 'none', fontWeight: 600,
                            color: '#475569', borderColor: '#cbd5e1',
                            '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }
                        }}
                    >
                        Импорт Excel
                    </Button>
                </Stack>
            </Paper>

            {/* --- ТАБЛИЦА --- */}
            <Paper
                elevation={0}
                sx={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: 'white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)' // Легкая тень
                }}
            >
                <DataGrid
                    rows={data?.results || []}
                    columns={columns}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    pageSizeOptions={[10, 20, 50]}
                    autoHeight
                    disableRowSelectionOnClick
                    rowHeight={60} // Чуть выше строки, чтобы было просторнее
                    sx={{
                        border: 'none',
                        // Стили заголовка
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: '#f8fafc',
                            color: '#475569',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            fontSize: '0.75rem',
                            borderBottom: '1px solid #e2e8f0'
                        },
                        // Стили ячеек
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid #f1f5f9'
                        },
                        // Убираем фокус при клике (синюю рамку)
                        '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus': { outline: 'none' },
                    }}
                />
            </Paper>
        </Box>
    );
};

export default SubstancesList;