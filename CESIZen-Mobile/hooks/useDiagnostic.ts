import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// 1. Récupérer le catalogue de tests
export const useDiagnosticTests = () => {
    return useQuery({
        queryKey: ['diagnosticTests'],
        queryFn: async () => {
            const response = await api.get('/diagnostic/tests');
            return response.data.data.tests;
        },
    });
};

// 2. Récupérer les questions d'un test spécifique
export const useDiagnosticTestQuestions = (testId: string) => {
    return useQuery({
        queryKey: ['diagnosticQuestions', testId],
        queryFn: async () => {
            const response = await api.get(`/diagnostic/tests/${testId}/questions`);
            return response.data.data.questions;
        },
        enabled: !!testId, // Ne lance la requête que si on a un ID
    });
};

// 3. Sauvegarder le résultat
export const useSaveTestResult = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ testId, score }: { testId: string, score: number }) => {
            const response = await api.post(`/diagnostic/tests/${testId}/results`, { score });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['diagnosticResults'] });
        },
    });
};