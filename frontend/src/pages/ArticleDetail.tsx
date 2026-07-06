import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Loader2 } from 'lucide-react';
import api from '../api/api';

interface Article {
    title: string;
    content: string;
    category: string;
    imageUrl?: string;
    author: { firstname: string; lastname: string };
    publishedAt: string;
}

const ArticleDetail = () => {
    const { id } = useParams(); // Récupère l'ID de l'URL
    const navigate = useNavigate();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                // On appelle ton API pour un seul article
                const res = await api.get(`/articles/${id}`);
                setArticle(res.data.data.article);
            } catch (err) {
                console.error("Erreur article:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-zen-sage" size={40} /></div>;
    if (!article) return <div className="p-10 text-center">Article introuvable. 😕</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Bouton Retour */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-zen-sage transition-colors font-bold text-sm uppercase tracking-widest"
            >
                <ArrowLeft size={18} /> Retour à la bibliothèque
            </button>

            {/* Header de l'article */}
            <header className="space-y-6">
                <span className="bg-zen-sage/10 text-zen-sage px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                    {article.category}
                </span>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
                    {article.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm border-y border-gray-50 py-6">
                    <span className="flex items-center gap-2"><User size={16} /> {article.author.firstname} {article.author.lastname}</span>
                    <span className="flex items-center gap-2"><Calendar size={16} /> {new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
            </header>

            {/* Image principale */}
            {article.imageUrl && (
                <div className="rounded-3xl overflow-hidden shadow-2xl shadow-zen-sage/10">
                    <img src={article.imageUrl} alt={article.title} className="w-full h-auto object-cover" />
                </div>
            )}

            {/* Contenu (Texte) */}
            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-6">
                {/* On sépare les paragraphes par les retours à la ligne */}
                {article.content.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                ))}
            </div>
        </div>
    );
};

export default ArticleDetail;