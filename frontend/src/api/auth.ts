import client from './client';

export interface CompanyData {
    company_name: string;
    inn: string;
    address: string;
    phone: string;
    is_manufacturer: boolean;
    is_importer: boolean;
    is_exporter: boolean;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    company: CompanyData;
}

export const registerUser = async (data: RegisterData) => {
    const response = await client.post('/auth/register/', data);
    return response.data;
};

// Функция для получения профиля (Кто я?)
export const getProfile = async () => {
    const response = await client.get<{username:string, role:string, company: CompanyData}>('/auth/me/');
    return response.data;
};
export const updateProfile = async (data: any) => {
    // Если передаем файл, нужно использовать FormData
    // Проверяем, есть ли там файл
    const isMultipart = data instanceof FormData;

    const response = await client.patch('/auth/me/', data, {
        headers: isMultipart ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
};