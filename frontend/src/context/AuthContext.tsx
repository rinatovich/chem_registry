import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';
import { jwtDecode } from "jwt-decode"; // Исправляем импорт jwt-decode (он капризный)

interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, refresh: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));

    // Проверяем валидность токена при загрузке
    const isAuthenticated = !!token;

    const login = (accessToken: string, refreshToken: string) => {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        setToken(accessToken);
        // client.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`; // Можно и так
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Хук для быстрого использования
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};