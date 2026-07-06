import React, { useEffect, useState } from 'react';
import { Plus, Loader2, Trash2, CheckCircle } from 'lucide-react';
import api from '../../api/api';

interface Emotion {
    _id: string;
    name: string;
    color: string;
    iconUrl?: string;
    isActive: boolean;
    baseEmotion?: { _id: string; name: string };
}

const AdminEmotions = () => {
    const [emotions, setEmotions] = useState<Emotion[]>([]);
    const [details, setDetails] = useState<Emotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('lvl1'); // 'lvl1' ou 'lvl2'

    // Formulaire
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        color: '#94a3b8',
        iconUrl: '',
        baseEmotion: '' // Uniquement pour le Lvl 2
    });

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const res = await api.get('/emotions/admin');
            setEmotions(res.data.data.emotions);
            setDetails(res.data.data.details);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (tab === 'lvl1') {
                await api.post('/emotions', formData);
            } else {
                await api.post('/emotions/details', formData);
            }
            setShowForm(false);
            setFormData({ name: '', color: '#94a3b8', iconUrl: '', baseEmotion: '' });
            fetchAll();
        } catch { alert("Erreur lors de la création"); }
    };

    const toggleStatus = async (id: string, isLvl1: boolean, currentStatus: boolean) => {
        try {
            const newStatus = !currentStatus;
            let endpoint = "";
            if (newStatus === false) {
                endpoint = isLvl1 ? `/emotions/${id}` : `/emotions/details/${id}`;
                api.delete(endpoint);
            } else {
                endpoint = isLvl1 ? `/emotions/${id}` : `/emotions/details/${id}`;
                api.patch(endpoint, { isActive: newStatus });
            }

            fetchAll();
        } catch {
            alert("Erreur lors du changement de statut");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-zen-sage" size={40} /></div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gestion de la Roue des Émotions</h1>
                    <p className="text-gray-500">Configurez les émotions disponibles pour les utilisateurs.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-zen-dark text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-zen-sage transition-all"
                >
                    <Plus size={20} /> Ajouter {tab === 'lvl1' ? 'une base' : 'un détail'}
                </button>
            </header>

            {/* Onglets */}
            <div className="flex gap-4 border-b border-gray-100">
                <button onClick={() => setTab('lvl1')} className={`pb-4 px-2 font-bold text-sm transition-all ${tab === 'lvl1' ? 'text-zen-sage border-b-2 border-zen-sage' : 'text-gray-400'}`}>
                    Niveau 1 (Émotions de base)
                </button>
                <button onClick={() => setTab('lvl2')} className={`pb-4 px-2 font-bold text-sm transition-all ${tab === 'lvl2' ? 'text-zen-sage border-b-2 border-zen-sage' : 'text-gray-400'}`}>
                    Niveau 2 (Précisions)
                </button>
            </div>

            {/* Formulaire Rapide */}
            {showForm && (
                <div className="bg-white p-6 rounded-zen border border-zen-sage/20 shadow-xl shadow-zen-sage/5 animate-in slide-in-from-top-4">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400">Nom</label>
                            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none" placeholder="Ex: Joie, Colère..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400">Couleur</label>
                            <div className="flex gap-2">
                                <input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="h-10 w-10 border-none bg-transparent cursor-pointer" />
                                <input value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl px-3 text-xs" />
                            </div>
                        </div>
                        {tab === 'lvl2' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400">Émotion parente</label>
                                <select required value={formData.baseEmotion} onChange={e => setFormData({ ...formData, baseEmotion: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none">
                                    <option value="">Sélectionner...</option>
                                    {emotions.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <button type="submit" className="flex-1 bg-zen-sage text-white font-bold py-3 rounded-xl">Enregistrer</button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-3 bg-gray-100 text-gray-400 rounded-xl">Annuler</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Liste */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(tab === 'lvl1' ? emotions : details).map((emo) => (
                    <div
                        key={emo._id}
                        className={`bg-white p-4 rounded-2xl border flex items-center justify-between group transition-all ${emo.isActive ? 'border-gray-100' : 'border-red-100 bg-red-50/30 opacity-60'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-inner" style={{ backgroundColor: emo.color }}>
                                {emo.name[0]}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-gray-800">{emo.name}</p>
                                    {!emo.isActive && <span className="text-[8px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded font-black uppercase">Inactif</span>}
                                </div>
                                {tab === 'lvl2' && (
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                        Parent: {emo.baseEmotion?.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => toggleStatus(emo._id, tab === 'lvl1', emo.isActive)}
                            className={`p-2 rounded-xl transition-all ${emo.isActive
                                ? 'text-gray-300 hover:text-red-400 hover:bg-red-50'
                                : 'text-green-400 hover:bg-green-50 shadow-sm border border-green-100'
                                }`}
                            title={emo.isActive ? "Désactiver" : "Réactiver"}
                        >
                            {emo.isActive ? <Trash2 size={16} /> : <CheckCircle size={16} />}
                        </button>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminEmotions;