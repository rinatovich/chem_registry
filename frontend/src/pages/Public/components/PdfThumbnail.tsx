import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Box, Skeleton, Typography } from '@mui/material';
import { PictureAsPdf, BrokenImage } from '@mui/icons-material';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Настройка воркера (движка PDF)
// Используем CDN для стабильности, чтобы не возиться с копированием файлов в Vite
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
    url: string;
    width?: number;
}

export const PdfThumbnail = ({ url, width = 280 }: Props) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
    };

    const onDocumentLoadError = () => {
        setLoading(false);
        setError(true);
    };

    // Если ошибка загрузки или не PDF
    if (error) {
        return (
            <Box
                sx={{
                    height: 140, bgcolor: '#f1f5f9', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', color: '#94a3b8',
                    borderBottom: '1px solid #e2e8f0'
                }}
            >
                <BrokenImage fontSize="large" />
                <Typography variant="caption" sx={{mt:1}}>Превью недоступно</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width: '100%',
                height: 'auto',
                bgcolor: '#e2e8f0',
                overflow: 'hidden',
                position: 'relative',
                minHeight: 140,
                display: 'flex',
                justifyContent: 'center',
                borderBottom: '1px solid #ddd'
            }}
        >
            {/* Лоадер пока грузится */}
            {loading && (
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={140}
                    sx={{ position: 'absolute', top:0, left:0, zIndex:2 }}
                />
            )}

            {/* Рендер PDF */}
            <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div />}
            >
                <Page
                    pageNumber={1}
                    width={width}
                    renderTextLayer={false} // Отключаем текст (нужна только картинка)
                    renderAnnotationLayer={false}
                />
            </Document>

            {/* Иконка поверх картинки для стиля */}
            {!loading && !error && (
                <Box
                    sx={{
                        position: 'absolute', bottom: 5, right: 5,
                        bgcolor: 'rgba(255,255,255,0.8)',
                        borderRadius: '50%', p: 0.5,
                        display: 'flex'
                    }}
                >
                    <PictureAsPdf color="error" fontSize="small" />
                </Box>
            )}
        </Box>
    );
};