import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Loader2, TrendingUp } from 'lucide-react';
import api from '../api/api';

interface StatItem {
    name: string;
    value: number;
    color: string;
}

interface RawStatItem {
    _id: string;
    count: number;
    color?: string;
}

const WeeklyStats = () => {
    const [data, setData] = useState<StatItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/diary/report?period=week');
                // Ton backend renvoie : { data: { stats: [ { _id: "Joie", count: 5, color: "#..." }, ... ] } }
                const formattedData = res.data.data.stats.map((item: RawStatItem) => ({
                    name: item._id,
                    value: item.count,
                    color: item.color || '#94a3b8' // Couleur par défaut si absente
                }));
                setData(formattedData);
            } catch (err) {
                console.error("Erreur stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-zen-sage" /></div>;

    if (data.length === 0) return (
        <div className="h-64 flex flex-col items-center justify-center text-gray-400 italic text-sm border-2 border-dashed border-gray-50 rounded-zen">
            Pas encore de données pour cette semaine.
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-zen border border-gray-50 shadow-sm h-full">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-zen-sage/10 rounded-lg text-zen-sage">
                    <TrendingUp size={20} />
                </div>
                <h3 className="font-bold text-gray-800">Météo de la semaine</h3>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry: StatItem, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <p className="mt-4 text-[11px] text-center text-gray-400 uppercase tracking-widest font-bold">
                Basé sur vos {data.reduce((acc, curr: StatItem) => acc + curr.value, 0)} dernières notes
            </p>
        </div>
    );
};

export default WeeklyStats;