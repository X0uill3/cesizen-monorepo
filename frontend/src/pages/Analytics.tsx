import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, Calendar, Zap, Activity, Loader2 } from 'lucide-react';
import api from '../api/api';

interface StatItem {
    name: string;
    value: number;
    color: string;
}

interface RawStatItem {
    _id: string;
    count: number;
    color: string;
}

interface DiaryEntry {
    date: string;
}

const Analytics = () => {
    const [stats, setStats] = useState<StatItem[]>([]);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');

    // Fonction de calcul de la série (streak)
    const calculateStreak = (entries: DiaryEntry[]) => {
        if (!entries || entries.length === 0) return 0;

        // 1. Extraire les dates uniques au format YYYY-MM-DD et trier du plus récent au plus ancien
        const dates = entries.map(e => new Date(e.date).toISOString().split('T')[0]);
        const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // 2. Si pas d'entrée aujourd'hui ET pas d'entrée hier, la série est brisée (0)
        if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
            return 0;
        }

        let currentStreak = 0;
        // On commence la vérification soit à partir d'aujourd'hui (si présent), soit d'hier
        const checkDate = new Date(uniqueDates.includes(today) ? today : yesterday);

        // 3. Boucler en remontant le temps tant qu'on trouve la date dans nos entrées
        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (uniqueDates.includes(dateStr)) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1); // On recule d'un jour
            } else {
                break; // Trou dans la série
            }
        }
        return currentStreak;
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // On récupère les stats pour les graphiques ET le journal pour le streak
                const [statsRes, diaryRes] = await Promise.all([
                    api.get(`/diary/report?period=${period}`),
                    api.get('/diary')
                ]);

                // Formatage Stats
                const formattedStats = statsRes.data.data.stats.map((s: RawStatItem) => ({
                    name: s._id,
                    value: s.count,
                    color: s.color
                }));

                setStats(formattedStats);

                // Calcul du streak dynamique
                const entries = diaryRes.data.data.entries;
                setStreak(calculateStreak(entries));

            } catch (err) {
                console.error("Erreur Analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [period]);

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-zen-sage" size={40} />
        </div>
    );

    const totalEntries = stats.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Mes Analyses</h1>
                    <p className="text-gray-500 mt-1">Observez vos tendances et progressez vers la sérénité.</p>
                </div>

                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                    {[
                        { key: 'week',    label: '7 Jours'   },
                        { key: 'month',   label: '30 Jours'  },
                        { key: 'quarter', label: 'Trimestre' },
                        { key: 'year',    label: 'Année'     },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setPeriod(key)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${period === key ? 'bg-zen-sage text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Cartes de résumé rapide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<Activity className="text-zen-sage" />} label="Notes enregistrées" value={totalEntries} color="bg-zen-sage/10" />
                <StatCard icon={<TrendingUp className="text-zen-sky" />} label="Émotion dominante" value={stats[0]?.name || "N/A"} color="bg-zen-sky/10" />
                <StatCard
                    icon={<Zap className={`${streak > 0 ? 'text-orange-400' : 'text-gray-300'}`} />}
                    label="Jours de présence"
                    value={`${streak} ${streak > 1 ? 'jours' : 'jour'}`}
                    color={streak > 0 ? "bg-orange-50" : "bg-gray-50"}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Graphique 1 : Répartition (Pie Chart) */}
                <div className="bg-white p-8 rounded-zen border border-gray-50 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-8 flex items-center gap-2">
                        <Calendar size={20} className="text-gray-400" /> Répartition des émotions
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats} dataKey="value" innerRadius={80} outerRadius={110} paddingAngle={8} stroke="none">
                                    {stats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Graphique 2 : Fréquence (Bar Chart) */}
                <div className="bg-white p-8 rounded-zen border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-8 flex items-center gap-2">
                        <TrendingUp size={20} className="text-gray-400" /> Intensité de présence
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '15px', border: 'none' }} />
                                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                    {stats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => (
    <div className="bg-white p-6 rounded-zen border border-gray-50 shadow-sm flex items-center gap-6">
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center transition-all`}>
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

export default Analytics;