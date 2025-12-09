import client from './client';

// === 1. ТИПЫ ДАННЫХ (INTERFACES) ===

export interface ChemicalElement {
    id: number;
    cas_number: string | null;
    primary_name_ru: string;
    status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';
    updated_at: string;
    hazard_class?: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface TaskResponse {
    task_id: string;
    status: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'DONE' | 'FAILURE' | 'ERROR';
    result?: {
        status?: string;
        imported?: number;
        errors?: string[];
    };
}

// Интерфейс для подсказки поиска
export interface SuggestionItem {
    label: string;
    type: string;
    id: number;
}

// === 2. API ФУНКЦИИ ===

// Получение списка веществ
export const getMyElements = async () => {
    const response = await client.get<PaginatedResponse<ChemicalElement>>('/registry/elements/');
    return response.data;
};

// Функция автокомплита (Подсказки)
export const getSuggestions = async (query: string) => {
    if (!query || query.length < 2) return [];
    const response = await client.get<SuggestionItem[]>('/registry/elements/suggest/', {
        params: { search: query }
    });
    return response.data;
};

// Скачивание шаблона Excel
export const downloadTemplate = async () => {
    const response = await client.get('/registry/import/template/', {
        responseType: 'blob', // Важно: ответ бинарный
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'registry_template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
};

// Загрузка файла (Начало импорта)
export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post<{task_id: string}>('/registry/import/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// Проверка статуса задачи (Polling)
export const checkTask = async (taskId: string) => {
    const response = await client.get<TaskResponse>(`/registry/tasks/${taskId}/`);
    return response.data;
};

export const getElementById = async (id: string | number) => {
    const response = await client.get<any>(`/registry/elements/${id}/`);
    return response.data;
};

// Скачать Паспорт (PDF)
export const downloadPassport = async (id: number | string, filename?: string) => {
    const response = await client.get(`/registry/elements/${id}/pdf/`, {
        responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `passport_${id}.pdf`);
    document.body.appendChild(link);
    link.click();

    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
};

// Обновить (PATCH)
export const updateElement = async (id: string | number, data: any) => {
    const response = await client.patch(`/registry/elements/${id}/`, data);
    return response.data;
};

// Создать (POST)
export const createElement = async (data: any) => {
    const response = await client.post('/registry/elements/', data);
    return response.data;
};

export const uploadElementFile = async (elementId: string | number, file: File, description: string, docType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('doc_type', docType);

    const response = await client.post(`/registry/elements/${elementId}/upload_attachment/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const deleteElementFile = async (elementId: string | number, attachmentId: number) => {
    await client.delete(`/registry/elements/${elementId}/delete_attachment/${attachmentId}/`);
};

export const uploadStructureImage = async (elementId: string | number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await client.post(`/registry/elements/${elementId}/upload_structure/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// В конец файла frontend/src/api/registry.ts

export const getStatistics = async () => {
    const response = await client.get('/registry/stats/');
    return response.data;
};