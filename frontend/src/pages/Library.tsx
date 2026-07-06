import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, User, Calendar, Loader2 } from 'lucide-react';
import api from '../api/api';
import { Link } from 'react-router-dom';

interface Article {
    _id: string;
    title: string;
    content: string;
    category: string;
    imageUrl?: string;
    author: { firstname: string; lastname: string };
    publishedAt: string;
}

const Library = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await api.get('/articles');
                // On suit ta structure : res.data.data.articles
                setArticles(res.data.data.articles);
            } catch (err) {
                console.error("Erreur chargement articles", err);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    const filteredArticles = articles.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-zen-sage" size={40} />
        </div>
    );

    return (
        <div className="space-y-10 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Bibliothèque</h1>
                    <p className="text-gray-500 mt-2 text-lg">Apprenez à mieux comprendre votre esprit.</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher par titre ou catégorie..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-4 focus:ring-zen-sage/10 outline-none transition-all"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((article) => (
                    <article key={article._id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col group">
                        {/* Image ou Placeholder */}
                        <div className="h-52 bg-zen-sage/5 relative overflow-hidden">
                            {article.imageUrl ? (
                                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zen-sage/20">
                                    <span className="text-6xl italic serif">Z</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4">
                                <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-zen-sage shadow-sm">
                                    {article.category}
                                </span>
                            </div>
                        </div>

                        <div className="p-8 flex flex-col flex-grow">
                            <div className="flex items-center gap-4 text-gray-400 text-[10px] font-bold uppercase mb-4">
                                <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(article.publishedAt).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1.5"><User size={14} /> {article.author.firstname}</span>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-800 mb-4 leading-snug group-hover:text-zen-sage transition-colors">
                                {article.title}
                            </h3>

                            {/* Extrait du contenu (limité à 3 lignes) */}
                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-8">
                                {article.content.replace(/<[^>]*>?/gm, '')}
                            </p>

                            <Link
                                to={`/bibliotheque/${article._id}`}
                                className="mt-auto w-full py-4 bg-zen-dark text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-zen-sage transition-all shadow-lg shadow-zen-dark/10 text-center"
                            >
                                Lire l'article <ChevronRight size={18} />
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default Library;