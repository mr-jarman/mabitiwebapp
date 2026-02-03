import api from './api';
import { Property } from '../types';

export interface Rental {
    id: number;
    user: number;
    property: string;
    property_details: Property;
    start_date: string;
    end_date: string;
    days: number;
    total_price: number;
    is_active: boolean;
    created_at: string;
}

export const rentalService = {
    getAll: async (): Promise<Rental[]> => {
        const response = await api.get('properties/rentals/');
        return response.data;
    },

    create: async (rentalData: {
        property: string;
        start_date: string;
        end_date: string;
        days: number;
        total_price: number;
    }): Promise<Rental> => {
        const response = await api.post('properties/rentals/', rentalData);
        return response.data;
    },

    getById: async (id: number): Promise<Rental> => {
        const response = await api.get(`properties/rentals/${id}/`);
        return response.data;
    }
};
