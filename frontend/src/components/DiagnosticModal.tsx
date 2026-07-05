import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import api from '../api/api';

interface Answer {
    label: string;
    points: number;
}

interface DiagnosticModalProps {
    isOpen: boolean;
    onClose: () => void;
    question: any;
    testId: string;
    onSuccess: () => void;
}

const DiagnosticModal = ({ isOpen, onClose, question, testId, onSuccess }: DiagnosticModalProps) => {
    // --- ÉTATS DU FORMULAIRE ---
    const [text, setText] = useState('');
    const [order, setOrder] = useState<number>(0);
    const [answers, setAnswers] = useState<Answer[]>([
        { label: '', points: 0 },
        { label: '', points: 1 } // On met 2 réponses par défaut pour aider
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- INITIALISATION (Création vs Édition) ---
    useEffect(() => {
        if (question) {
            // Mode Édition
            setText(question.text);
            setOrder(question.order);
            setAnswers(question.answers || []);
        } else {
            // Mode Création (Reset)
            setText('');
            setOrder(0);
            setAnswers([{ label: '', points: 0 }, { label: '', points: 1 }]);
        }
        setError('');
    }, [question, isOpen]);

    // --- GESTION DYNAMIQUE DES RÉPONSES ---
    const handleAddAnswer = () => {
        setAnswers([...answers, { label: '', points: 0 }]);
    };

    const handleRemoveAnswer = (index: number) => {
        const newAnswers = answers.filter((_, i) => i !== index);
        setAnswers(newAnswers);
    };

    const handleAnswerChange = (index: number, field: 'label' | 'points', value: string | number) => {
        const newAnswers = [...answers];
        newAnswers[index] = { ...newAnswers[index], [field]: value };
        setAnswers(newAnswers);
    };

    // --- SOUMISSION DU FORMULAIRE ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation basique
        if (!text.trim()) return setError("La question est obligatoire.");
        if (answers.length < 2) return setError("Il faut au moins 2 réponses possibles.");
        if (answers.some(a => !a.label.trim())) return setError("Toutes les réponses doivent avoir un libellé.");

        setLoading(true);

        const payload = {
            text,
            order: Number(order),
            answers
        };

        try {
            if (question) {
                await api.put(`/diagnostic/admin/questions/${question._id}`, payload);
            } else {
                await api.post(`/diagnostic/admin/tests/${testId}/questions`, payload);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop assombri */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modale */}
            <div className="bg-white w-full max-w-2xl rounded-zen shadow-2xl relative z-10 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {question ? 'Modifier la question' : 'Nouvelle question'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 bg-gray-50 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Contenu scrollable */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-xl text-sm font-semibold border border-red-100">
                            {error}
                        </div>
                    )}

                    <form id="diagnostic-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* CHAMP : QUESTION */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Intitulé de la question</label>
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Ex: À quelle fréquence vous sentez-vous fatigué(e) ?"
                                className="w-full bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-zen-sage/20 text-gray-700 font-medium"
                            />
                        </div>

                        {/* CHAMP : ORDRE */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Ordre d'affichage</label>
                            <input
                                type="number"
                                value={order}
                                onChange={(e) => setOrder(Number(e.target.value))}
                                className="w-full md:w-1/3 bg-gray-50 border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-zen-sage/20 text-gray-700"
                                min="0"
                            />
                            <p className="text-xs text-gray-400 italic">Détermine la position de cette question dans le test (0 = premier).</p>
                        </div>

                        <hr className="border-gray-100" />

                        {/* SECTION : RÉPONSES */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Réponses & Points</label>
                                <button
                                    type="button"
                                    onClick={handleAddAnswer}
                                    className="flex items-center gap-1 text-xs font-bold text-zen-sage hover:bg-zen-sage/10 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Plus size={14} /> Ajouter un choix
                                </button>
                            </div>

                            <div className="space-y-3">
                                {answers.map((answer, index) => (
                                    <div key={index} className="flex items-center gap-3 bg-white border border-gray-100 p-2 rounded-xl shadow-sm">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={answer.label}
                                                onChange={(e) => handleAnswerChange(index, 'label', e.target.value)}
                                                placeholder="Ex: Souvent"
                                                className="w-full bg-transparent border-none p-2 outline-none text-sm text-gray-700 font-medium"
                                            />
                                        </div>
                                        <div className="w-24 border-l border-gray-100 pl-3">
                                            <input
                                                type="number"
                                                value={answer.points}
                                                onChange={(e) => handleAnswerChange(index, 'points', Number(e.target.value))}
                                                placeholder="Pts"
                                                className="w-full bg-gray-50 rounded-lg p-2 outline-none text-sm text-center font-bold text-zen-sage"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAnswer(index)}
                                            disabled={answers.length <= 2} // Empêche d'avoir moins de 2 réponses
                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-300"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer / Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-zen flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors text-sm"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        form="diagnostic-form"
                        disabled={loading}
                        className="bg-zen-sage text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-zen-sage/20 hover:opacity-90 transition-all text-sm disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Enregistrer</>}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default DiagnosticModal;