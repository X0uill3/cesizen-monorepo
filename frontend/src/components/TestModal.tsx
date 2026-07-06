import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import api from '../api/api';
import { getErrorMessage } from '../utils/errors';

interface Rule {
    minScore: number;
    maxScore: number;
    title: string;
    description: string;
    color: string;
}

export interface DiagnosticTest {
    _id: string;
    title: string;
    description: string;
    rules: Rule[];
    isActive?: boolean;
}

interface TestModalProps {
    isOpen: boolean;
    onClose: () => void;
    testData: DiagnosticTest | null; // null si création, objet si édition
    onSuccess: () => void;
}

const TestModal = ({ isOpen, onClose, testData, onSuccess }: TestModalProps) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [rules, setRules] = useState<Rule[]>([
        { minScore: 0, maxScore: 5, title: 'Résultat 1', description: '...', color: '#8BA889' }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (testData) {
            setTitle(testData.title);
            setDescription(testData.description);
            setRules(testData.rules || []);
        } else {
            setTitle('');
            setDescription('');
            setRules([{ minScore: 0, maxScore: 5, title: '', description: '', color: '#8BA889' }]);
        }
        setError('');
    }, [testData, isOpen]);

    const handleAddRule = () => {
        setRules([...rules, { minScore: 0, maxScore: 0, title: '', description: '', color: '#8BA889' }]);
    };

    const handleRemoveRule = (index: number) => {
        setRules(rules.filter((_, i) => i !== index));
    };

    const handleRuleChange = (index: number, field: keyof Rule, value: string | number) => {
        const newRules = [...rules];
        newRules[index] = { ...newRules[index], [field]: value };
        setRules(newRules);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!title.trim() || !description.trim()) return setError("Le titre et la description sont obligatoires.");
        if (rules.length === 0) return setError("Il faut au moins une règle de résultat.");

        setLoading(true);
        const payload = { title, description, rules };

        try {
            if (testData) {
                await api.put(`/diagnostic/admin/tests/${testData._id}`, payload);
            } else {
                await api.post('/diagnostic/admin/tests', payload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(getErrorMessage(err, "Erreur lors de l'enregistrement."));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-3xl rounded-zen shadow-2xl relative z-10 flex flex-col max-h-[90vh]">

                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800">{testData ? 'Modifier le test' : 'Nouveau test'}</h2>
                    <button onClick={onClose} className="p-2 bg-gray-50 rounded-full"><X size={20} /></button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {error && <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg text-sm">{error}</div>}

                    <form id="test-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Titre du Test</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Évaluation du Stress" className="w-full bg-gray-50 rounded-xl p-3 outline-none" required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Description</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Courte description pour l'utilisateur..." className="w-full bg-gray-50 rounded-xl p-3 outline-none min-h-[80px]" required />
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Règles de résultats (Scores)</label>
                                <button type="button" onClick={handleAddRule} className="flex items-center gap-1 text-xs font-bold text-zen-sage hover:bg-zen-sage/10 px-3 py-1.5 rounded-lg"><Plus size={14} /> Ajouter une règle</button>
                            </div>

                            <div className="space-y-4">
                                {rules.map((rule, index) => (
                                    <div key={index} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm space-y-3 relative">
                                        <button type="button" onClick={() => handleRemoveRule(index)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>

                                        <div className="flex gap-4">
                                            <div className="w-24">
                                                <label className="text-[10px] uppercase text-gray-400">Score Min</label>
                                                <input type="number" value={rule.minScore} onChange={(e) => handleRuleChange(index, 'minScore', Number(e.target.value))} className="w-full bg-gray-50 rounded-lg p-2 text-sm" />
                                            </div>
                                            <div className="w-24">
                                                <label className="text-[10px] uppercase text-gray-400">Score Max</label>
                                                <input type="number" value={rule.maxScore} onChange={(e) => handleRuleChange(index, 'maxScore', Number(e.target.value))} className="w-full bg-gray-50 rounded-lg p-2 text-sm" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] uppercase text-gray-400">Titre du résultat</label>
                                                <input type="text" value={rule.title} onChange={(e) => handleRuleChange(index, 'title', e.target.value)} placeholder="Ex: Stress léger" className="w-full bg-gray-50 rounded-lg p-2 text-sm" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-gray-400">Message personnalisé</label>
                                            <textarea value={rule.description} onChange={(e) => handleRuleChange(index, 'description', e.target.value)} placeholder="Conseil affiché à l'utilisateur..." className="w-full bg-gray-50 rounded-lg p-2 text-sm h-16" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-zen flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 text-sm">Annuler</button>
                    <button type="submit" form="test-form" disabled={loading} className="bg-zen-sage text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-sm">{loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Enregistrer</>}</button>
                </div>
            </div>
        </div>
    );
};

export default TestModal;