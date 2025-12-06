import { useQuery } from '@tanstack/react-query';
// Мы разделяем Компонент (DataGrid) и Типы (type ...)
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { Paper, Typography, Box, Chip, Button, CircularProgress, Alert } from '@mui/material';
import { Add } from '@mui/icons-material';
import { getMyElements } from '../../api/registry';
import { useNavigate } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import { Edit } from '@mui/icons-material';

const SubstancesList = () => {
    const navigate = useNavigate();

    // Запрос данных (React Query кэширует это сам)
    const { data, isLoading, error } = useQuery({
        queryKey: ['my-elements'],
        queryFn: getMyElements,
    });

    // Настройка колонок таблицы
    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        {
            field: 'actions',
            headerName: '',
            width: 60,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Tooltip title="Редактировать">
                    <IconButton color="primary" onClick={(e) => {
                        e.stopPropagation(); // Чтобы клик по строке не мешал
                        navigate(`/dashboard/elements/${params.row.id}`);
                    }}>
                        <Edit />
                    </IconButton>
                </Tooltip>
            ),
        },
        {
            field: 'primary_name_ru',
            headerName: 'Название (RU)',
            flex: 1,
            minWidth: 200,
            renderCell: (params: GridRenderCellParams) => (
                <strong>{params.value}</strong>
            )
        },

        { field: 'cas_number', headerName: 'CAS №', width: 120 },
        { field: 'updated_at', headerName: 'Обновлено', width: 150, valueFormatter: (params) => new Date(params.value).toLocaleDateString() },
        {
            field: 'status',
            headerName: 'Статус',
            width: 140,
            renderCell: (params: GridRenderCellParams) => {
                // Цветные бейджи
                let color: "default" | "warning" | "success" | "error" = "default";
                let label = "Черновик";

                switch (params.value) {
                    case 'DRAFT': color = "default"; label="Черновик"; break;
                    case 'PENDING': color = "warning"; label="На проверке"; break;
                    case 'PUBLISHED': color = "success"; label="Опубликовано"; break;
                    case 'REJECTED': color = "error"; label="Отклонено"; break;
                }
                return <Chip label={label} color={color} size="small" variant="outlined" />;
            },
        },
    ];

    if (isLoading) return <Box sx={{ display:'flex', justifyContent:'center', mt:10 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">Ошибка загрузки данных</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                    Реестр химических веществ
                </Typography>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<Add />}
                    onClick={() => navigate('/dashboard/elements/new')} // Идем на new
                >
                    Создать вручную
                </Button>
                <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/dashboard/import')}>
                    Загрузить Excel
                </Button>
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                <DataGrid
                    rows={data?.results || []} // Берем массив из пагинации
                    columns={columns}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 20]}
                    autoHeight
                    disableRowSelectionOnClick
                    sx={{
                        '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8f9fa' },
                    }}
                />
            </Paper>
        </Box>
    );
};

export default SubstancesList;