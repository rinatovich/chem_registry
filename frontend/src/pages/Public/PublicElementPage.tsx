import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress, Alert, Grid } from '@mui/material';
import { getElementById } from '../../api/registry';
import { styles } from './PublicElementPage.styles';
import { ElementHeader } from './components/ElementHeader';
import { ElementSidebar } from './components/ElementSidebar';
import { ElementTabs } from './components/ElementTabs';

const PublicElementPage = () => {
    const { id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ['public-element', id],
        queryFn: () => getElementById(id!),
        enabled: !!id
    });

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><CircularProgress /></Box>;
    if (error) return <Box p={5}><Alert severity="error">Данные недоступны.</Alert></Box>;

    return (
        <Box sx={styles.pageContainer}>

            {/* --- ШАПКА --- */}
            <Box sx={styles.headerPaper}>
                <Box sx={styles.contentWrapper}>
                    <ElementHeader data={data} />
                </Box>
            </Box>

            {/* --- ОСНОВНОЙ КОНТЕНТ --- */}
            <Box sx={styles.contentWrapper}>
                <Grid container spacing={4}>

                    {/* 1. БЛОК С ТАБАМИ (Теперь во всю ширину) */}
                    <Grid item xs={12}>
                        <ElementTabs data={data} />
                    </Grid>

                    {/* 2. БЛОК С ДОКУМЕНТАМИ (Теперь снизу и во всю ширину) */}
                    <Grid item xs={12}>
                        <ElementSidebar attachments={data.attachments} />
                    </Grid>

                </Grid>
            </Box>
        </Box>
    );
};

export default PublicElementPage;