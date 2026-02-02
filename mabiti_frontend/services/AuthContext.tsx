import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';
import { User } from '../types';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    register: (username: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                await checkAuth();
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await api.get('auth/me/');
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            logout();
        }
    };

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await api.post('auth/login/', { username, password });
            const { access, refresh } = response.data;
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            await checkAuth();
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const register = async (username: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
        try {
            await api.post('auth/register/', { username, email, password });
            return { success: true, message: 'Registration successful! Please login.' };
        } catch (error: any) {
            console.error('Registration failed:', error);
            const message = error.response?.data?.username?.[0] ||
                error.response?.data?.email?.[0] ||
                'Registration failed. Please try again.';
            return { success: false, message };
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black text-zinc-400">Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
