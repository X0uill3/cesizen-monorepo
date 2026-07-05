import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface AuthState {
    user: any | null;
    token: string | null;
    isLoading: boolean;
    setUser: (user: any) => void;
    login: (credentials: object) => Promise<void>;
    logout: () => Promise<void>;
    register: (userData: object) => Promise<void>;
    restoreToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoading: true,
    setUser: (user) => set({ user }),

    login: async (credentials) => {
        try {
            set({ isLoading: true });
            // CESIZen utilise /auth/login 

            const response = await api.post('/auth/login', credentials);
            // La structure de réponse de ton API est { status, token, data: { user } } 

            const { token, data } = response.data;

            await SecureStore.setItemAsync('userToken', token);
            set({ token, user: data.user, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false });

            // C'est mieux de relancer l'erreur avec le message de l'API 
            throw new Error(error.response?.data?.message || "Erreur de connexion");
        }
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('userToken');
        set({ token: null, user: null, isLoading: false });
    },

    register: async (userData) => {
        try {
            set({ isLoading: true });
            // CESIZen utilise /auth/signup 
            const response = await api.post('/auth/signup', userData);
            const { token, data } = response.data;

            await SecureStore.setItemAsync('userToken', token);
            set({ token, user: data.user, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false });
            throw new Error(error.response?.data?.message || "Erreur d'inscription");
        }
    },

    restoreToken: async () => {
        set({ isLoading: true });
        try {
            const token = await SecureStore.getItemAsync('userToken');

            if (token) {
                // CESIZen utilise /users/me 
                const response = await api.get('/users/me');
                set({ token, user: response.data.data.user, isLoading: false });
            } else {
                set({ token: null, user: null, isLoading: false });
            }
        } catch (error) {
            // Si le serveur répond 401 ou si le compte est 'Disabled' 
            await SecureStore.deleteItemAsync('userToken');
            set({ token: null, user: null, isLoading: false });
        }
    },

    deleteAccount: async () => {
        try {
            set({ isLoading: true });
            await api.delete('/users/deleteMe');
            await SecureStore.deleteItemAsync('userToken');
            set({ token: null, user: null, isLoading: false });
        } catch (error: any) {
            set({ isLoading: false });
            throw new Error(error.response?.data?.message || "Erreur lors de la suppression du compte");
        }
    }
}));