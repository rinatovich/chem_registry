import axios from 'axios';

// Базовый URL. Благодаря прокси в Vite мы пишем просто /api
export const API_URL = '/api';

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// === АВТО-ТОКЕН ===
// Перед отправкой каждого запроса, проверяем localStorage
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// === ОБРАБОТКА ОШИБОК ===
// Если токен протух (401), выбрасываем юзера (пока просто чистим сторадж)
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401)) {
            // Если ошибка авторизации - можно чистить токен или редиректить
            // localStorage.removeItem('access_token');
            // window.location.href = '/login'; // Хардкорный редирект
        }
        return Promise.reject(error);
    }
);

export default client;