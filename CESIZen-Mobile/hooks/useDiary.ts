import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// 1. Récupérer la liste des émotions de base (Joie, Tristesse, etc.) 
export const useEmotions = () => {
    return useQuery({
        queryKey: ['emotions'],
        queryFn: async () => {
            const response = await api.get('/emotions');
            // D'après ta doc API, les données sont dans data.data.emotions 
            return response.data.data.emotions;
        },
    });
};

// 2. Poster une nouvelle entrée dans le journal 
export const useAddDiaryEntry = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // Le typage correspond exactement à ce qu'attend ton POST /api/diary 
        mutationFn: async (newEntry: { baseEmotionId: string; emotionDetailId?: string; comment: string; date: string }) => {
            const response = await api.post('/diary', newEntry);
            return response.data;
        },
        onSuccess: () => {
            // Magie de React Query : on invalide le cache pour que tes futurs graphiques 
            // et listes d'historique se mettent à jour instantanément !
            queryClient.invalidateQueries({ queryKey: ['diaryEntries'] });
            queryClient.invalidateQueries({ queryKey: ['diaryReport'] });
        },
    });
};

export const useEmotionDetails = (baseEmotionId: string | null) => {
    return useQuery({
        queryKey: ['emotionDetails', baseEmotionId],
        queryFn: async () => {
            const response = await api.get(`/emotions/${baseEmotionId}/details`);
            // Basé sur ton code web, la réponse est res.data.data.details
            return response.data.data.details;
        },
        // Très important : On ne lance la requête que si un ID est fourni
        enabled: !!baseEmotionId,
    });
};

export const useDiaryEntries = () => {
    return useQuery({
        queryKey: ['diaryEntries'],
        queryFn: async () => {
            const response = await api.get('/diary');
            return response.data.data.entries;
        },
    });
};

export const useDeleteEntry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/diary/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diaryEntries'] });
        },
    });
};

export const useUpdateDiaryEntry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string; baseEmotionId: string; emotionDetailId?: string; comment: string }) => {
            const response = await api.patch(`/diary/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diaryEntries'] });
            queryClient.invalidateQueries({ queryKey: ['diaryReport'] });
        },
    });
};

// Ajoute ceci dans ton fichier hooks/useDiary.ts
export const useDiaryReport = (period: string) => {
    return useQuery({
        queryKey: ['diaryReport', period],
        queryFn: async () => {
            const response = await api.get(`/diary/report?period=${period}`);
            return response.data.data.stats;
        },
    });
};