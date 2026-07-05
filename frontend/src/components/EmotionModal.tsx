import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import api from '../api/api';

interface EmotionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Interfaces basées sur tes modèles Backend
interface BaseEmotion { _id: string; name: string; color?: string; iconUrl?: string; }
interface DetailEmotion { _id: string; name: string; baseEmotion: string; }

const EmotionModal = ({ isOpen, onClose }: EmotionModalProps) => {
    // Listes chargées depuis l'API
    const [baseEmotions, setBaseEmotions] = useState<BaseEmotion[]>([]);
    const [details, setDetails] = useState<DetailEmotion[]>([]);

    // États du formulaire (Matching Body Backend)
    const [baseEmotionId, setBaseEmotionId] = useState<string>('');
    const [emotionDetailId, setEmotionDetailId] = useState<string>('');
    const [comment, setComment] = useState('');

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // 1. Charger Niveau 1
    useEffect(() => {
        if (isOpen) fetchBaseEmotions();
    }, [isOpen]);

    // 2. Charger Niveau 2 quand le Niveau 1 change
    useEffect(() => {
        if (baseEmotionId) {
            fetchDetails(baseEmotionId);
            setEmotionDetailId(''); // Reset le niveau 2 si on change le niveau 1
        }
    }, [baseEmotionId]);

    const fetchBaseEmotions = async () => {
        setFetching(true);
        try {
            const res = await api.get('/emotions');
            // Ton backend renvoie { status: 'success', data: { emotions: [...] } }
            setBaseEmotions(res.data.data.emotions);
        } catch (err) { console.error(err); }
        setFetching(false);
    };

    const fetchDetails = async (id: string) => {
        try {
            const res = await api.get(`/emotions/${id}/details`);
            // Ton backend renvoie { status: 'success', data: { details: [...] } }
            setDetails(res.data.data.details);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!baseEmotionId) return;

        setLoading(true);
        try {
            // Correspondance exacte avec ton createEntry (req.body)
            await api.post('/diary', {
                baseEmotionId,
                emotionDetailId: emotionDetailId || null,
                comment
            });
            handleClose();
        } catch (err) {
            console.error("Erreur d'enregistrement Diary", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setBaseEmotionId('');
        setEmotionDetailId('');
        setComment('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-lg rounded-zen shadow-2xl p-8 relative z-10">
                        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>

                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Comment ça va ?</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* NIVEAU 1 */}
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-3 block">Émotion principale</label>
                                <div className="flex flex-wrap gap-2">
                                    {fetching ? <Loader2 className="animate-spin text-zen-sage" /> : baseEmotions.map(emo => (
                                        <button
                                            type="button"
                                            key={emo._id}
                                            onClick={() => setBaseEmotionId(emo._id)}
                                            style={{ backgroundColor: baseEmotionId === emo._id ? emo.color : '' }}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${baseEmotionId === emo._id
                                                    ? 'text-white border-transparent shadow-lg scale-105'
                                                    : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
                                                }`}
                                        >
                                            {emo.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* NIVEAU 2 */}
                            {baseEmotionId && details.length > 0 && (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                    <label className="text-[10px] font-black uppercase text-gray-400 mb-3 block">Précision (Optionnel)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {details.map(det => (
                                            <button
                                                type="button"
                                                key={det._id}
                                                onClick={() => setEmotionDetailId(det._id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${emotionDetailId === det._id
                                                        ? 'bg-zen-dark text-white'
                                                        : 'bg-zen-sage/10 text-zen-sage hover:bg-zen-sage/20'
                                                    }`}
                                            >
                                                {det.name}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* COMMENTAIRE */}
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-3 block">Note (Optionnel)</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full bg-gray-50 rounded-2xl p-4 focus:ring-2 focus:ring-zen-sage/20 outline-none h-24 text-sm"
                                    placeholder="Écrivez ce qui vous passe par la tête..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!baseEmotionId || loading}
                                className="w-full bg-zen-sage text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 disabled:opacity-30 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <>Enregistrer mon entrée <Send size={18} /></>}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EmotionModal;