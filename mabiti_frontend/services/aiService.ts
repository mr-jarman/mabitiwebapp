import api from './api';
import { Property } from '../types';

export interface ChatResponse {
    response: string;
    properties: Property[];
    audio?: string; // base64
    intent_debug?: any;
}

export const aiService = {
    chat: async (message: string, locations?: Array<{ lat: number; lng: number }>, is_voice: boolean = false, audio?: string): Promise<ChatResponse> => {
        const response = await api.post('agent/chat/', {
            message,
            locations,
            is_voice,
            audio
        });
        return response.data;
    }
};
