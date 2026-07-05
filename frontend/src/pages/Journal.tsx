import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trash2, MessageCircle, ChevronRight, Inbox, Loader2 } from 'lucide-react';
import api from '../api/api';


interface DiaryEntry {
    _id: string;
    baseEmotion: { _id: string; name: string; color: string };
    emotionDetail?: { _id: string; name: string };
    comment: string;
    date: string;
}

const Journal = () => {
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const res = await api.get('/diary');
            // Structure : res.data.data.entries
            setEntries(res.data.data.entries);
        } catch (err) {
            console.error("Erreur lors de la récupération du journal", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Supprimer cette note de votre journal ?")) return;
        try {
            await api.delete(`/diary/${id}`);
            setEntries(entries.filter(e => e._id !== id));
        } catch (err) {
            console.error("Erreur suppression", err);
        }
    };

    // Formatage de la date à la française
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long'
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('fr-FR', {
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-zen-sage" size={40} />
            <p className="text-gray-400 font-medium italic">Récupération de vos souvenirs...</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Mon Journal</h1>
                    <p className="text-gray-500 mt-1">L'histoire de votre bien-être, jour après jour.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm text-sm font-bold text-zen-sage">
                    {entries.length} {entries.length > 1 ? 'entrées' : 'entrée'}
                </div>
            </header>

            {entries.length === 0 ? (
                <div className="bg-white rounded-zen p-20 text-center border-2 border-dashed border-gray-100">
                    <Inbox className="mx-auto text-gray-200 mb-4" size={48} />
                    <p className="text-gray-400 font-medium">Votre journal est encore vide.<br />Commencez par noter une émotion sur le Dashboard !</p>
                </div>
            ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-100 before:to-transparent">
                    <AnimatePresence>
                        {entries.map((entry, index) => (
                            <motion.div
                                key={entry._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                            >
                                {/* Le petit point sur la timeline */}
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"
                                    style={{ backgroundColor: entry.baseEmotion.color }}>
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                </div>

                                {/* La Carte */}
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-zen shadow-sm border border-gray-50 hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between mb-3">
                                        <time className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                                            <Calendar size={12} /> {formatDate(entry.date)} à {formatTime(entry.date)}
                                        </time>
                                        <button
                                            onClick={() => handleDelete(entry._id)}
                                            className="text-gray-300 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: entry.baseEmotion.color }}>
                                            {entry.baseEmotion.name}
                                        </span>
                                        {entry.emotionDetail && (
                                            <>
                                                <ChevronRight size={14} className="text-gray-300" />
                                                <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                                    {entry.emotionDetail.name}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {entry.comment && (
                                        <div className="bg-zen-cream/30 p-4 rounded-2xl flex gap-3 italic text-gray-600 text-sm border-l-4 border-zen-sage/20">
                                            <MessageCircle size={18} className="text-zen-sage shrink-0" />
                                            <p>"{entry.comment}"</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default Journal;