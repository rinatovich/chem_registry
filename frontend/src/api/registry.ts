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

// Вот тот самый интерфейс, на который ругается ошибка
export interface TaskResponse {
    task_id: string;
    status: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'DONE' | 'FAILURE' | 'ERROR';
    result?: {
        status?: string;
        imported?: number;
        errors?: string[];
    };
}

// === 2. API ФУНКЦИИ ===

// Получение списка веществ
export const getMyElements = async () => {
    const response = await client.get<PaginatedResponse<ChemicalElement>>('/registry/elements/');
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

// Обновить вещество (PATCH)
// export const updateElement = async (id: string | number, data: any) => {
//     const response = await client.patch(`/registry/elements/${id}/`, data);
//     return response.data;
// };

// Скачать Паспорт (PDF)
export const downloadPassport = async (id: number | string, filename?: string) => {
    const response = await client.get(`/registry/elements/${id}/pdf/`, {
        responseType: 'blob' // ВАЖНО: говорим Axios, что это файл
    });

    // Создаем виртуальную ссылку для скачивания
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `passport_${id}.pdf`);
    document.body.appendChild(link);
    link.click();

    // Чистим память
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
};

// Обновить (PATCH)
export const updateElement = async (id: string | number, data: any) => {
    const response = await client.patch(`/registry/elements/${id}/`, data);
    return response.data;
};

// === НОВОЕ: Создать (POST) ===
export const createElement = async (data: any) => {
    const response = await client.post('/registry/elements/', data);
    return response.data;
};