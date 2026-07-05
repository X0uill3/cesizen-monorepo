import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '../api/api';
// Importe tes catégories ici (adapte le chemin si besoin)
import { ArticleCategory } from '../constants/categories';

const ArticleModal = ({ isOpen, onClose, article, onSuccess }: any) => {
    // On initialise avec la première valeur de l'enum pour éviter les erreurs de validation
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: ArticleCategory.GENERAL || 'GENERAL',
        imageUrl: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (article) {
            setFormData({
                title: article.title,
                content: article.content,
                category: article.category,
                imageUrl: article.imageUrl || ''
            });
        } else {
            setFormData({
                title: '',
                content: '',
                category: ArticleCategory.GENERAL || 'GENERAL',
                imageUrl: ''
            });
        }
    }, [article, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (article && article._id) {
                await api.patch(`/articles/${article._id}`, formData);
            } else {
                // Utilisation de la route admin statique pour éviter le conflit d'ID
                await api.post('/articles/admin', formData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Détails de l'erreur:", err.response?.data);
            alert(`Erreur: ${err.response?.data?.message || "Impossible d'enregistrer l'article"}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white w-full max-w-2xl rounded-zen shadow-2xl p-8 relative z-10 max-h-[90vh] overflow-y-auto"
                    >
                        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-800 mb-8">
                            {article ? 'Modifier l\'article' : 'Créer un article'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Titre</label>
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-zen-sage/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400">Catégorie</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-zen-sage/20 font-medium"
                                    >
                                        {/* On boucle sur les clés de ton enum ArticleCategory */}
                                        {Object.values(ArticleCategory).map((cat: any) => (
                                            <option key={cat} value={cat}>
                                                {cat.charAt(0) + cat.slice(1).toLowerCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400">URL de l'image</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-3 text-gray-300" size={18} />
                                    <input
                                        value={formData.imageUrl}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                        className="w-full bg-gray-50 border-none rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-zen-sage/20"
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400">Contenu</label>
                                <textarea
                                    required
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-zen-sage/20 h-64 resize-none"
                                    placeholder="Rédigez votre article ici..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-zen-dark text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zen-sage transition-all shadow-lg"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Enregistrer l'article</>}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ArticleModal;