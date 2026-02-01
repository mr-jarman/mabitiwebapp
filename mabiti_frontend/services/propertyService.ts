import api from './api';
import { Property } from '../types';

export const propertyService = {
    getAll: async (): Promise<Property[]> => {
        const response = await api.get('properties/');
        return response.data;
    },

    getById: async (id: string): Promise<Property> => {
        const response = await api.get(`properties/${id}/`);
        return response.data;
    },

    toggleVisibility: async (id: string): Promise<any> => {
        const response = await api.post(`properties/${id}/toggle_visibility/`);
        return response.data;
    },

    deletePermanently: async (id: string): Promise<void> => {
        await api.delete(`properties/${id}/`);
    },

    create: async (data: any): Promise<Property> => {
        const response = await api.post('properties/', data);
        return response.data;
    }
};
