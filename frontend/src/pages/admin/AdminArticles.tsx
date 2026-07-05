import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, BookOpen } from 'lucide-react';
import api from '../../api/api';
import ArticleModal from '../../components/ArticleModal';

const AdminArticles = () => {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<any>(null);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const res = await api.get('/articles/admin');
            setArticles(res.data.data.articles);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleEdit = (article: any) => {
        setSelectedArticle(article);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedArticle(null);
        setIsModalOpen(true);
    };

    const toggleStatus = async (id: string) => {
        const currentStatus = articles.find(a => a._id === id)?.isActive;
        if (currentStatus) {
            try {
                await api.delete(`/articles/${id}`);
                fetchArticles();
            } catch (err) { alert("Erreur lors de la modification de l'article"); }
        } else {
            try {
                await api.patch(`/articles/${id}/activate`);
                fetchArticles();
            } catch (err) { alert("Erreur lors de la modification de l'article"); }
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-zen-sage" size={40} /></div>;

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gestion des Articles</h1>
                    <p className="text-gray-500">Rédigez et gérez les ressources de santé mentale.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-zen-sage text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-zen-sage/20 hover:opacity-90 transition-all"
                >
                    <Plus size={20} /> Nouvel Article
                </button>
            </header>

            <div className="bg-white rounded-zen shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Article</th>
                            <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Catégorie</th>
                            <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Auteur</th>
                            <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {articles.map((art) => (
                            <tr key={art._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 overflow-hidden">
                                            {art.imageUrl ? <img src={art.imageUrl} className="w-full h-full object-cover" /> : <BookOpen size={20} />}
                                        </div>
                                        <span className="font-bold text-gray-800 line-clamp-1">{art.title}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="text-xs font-bold text-zen-sage bg-zen-sage/10 px-3 py-1 rounded-full">{art.category}</span>
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                    {art.author?.firstname} {art.author?.lastname}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleEdit(art)} className="p-2 text-gray-400 hover:text-zen-sage hover:bg-gray-100 rounded-lg transition-all"><Edit2 size={18} /></button>
                                        <button
                                            onClick={() => toggleStatus(art._id)}
                                            className={`p-2 rounded-lg transition-all ${art.isActive ? 'text-green-400 hover:bg-green-50' : 'text-red-400 hover:bg-red-50'}`}
                                        >
                                            {art.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ArticleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                article={selectedArticle}
                onSuccess={fetchArticles}
            />
        </div>
    );
};

export default AdminArticles;