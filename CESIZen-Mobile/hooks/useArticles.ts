import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useArticles = () => {
    return useQuery({
        queryKey: ['articles'],
        queryFn: async () => {

            const response = await api.get('/articles');
            return response.data.data.articles;
        },
    });
};

export const useArticle = (id: string) => {
    return useQuery({
        queryKey: ['article', id],
        queryFn: async () => {
            const response = await api.get(`/articles/${id}`);
            return response.data.data.article;
        },
        enabled: !!id,
    });
};