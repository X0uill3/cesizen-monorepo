import React, { useEffect, useState } from 'react';
import { History, Shield, FileText, AlertCircle, Loader2, Clock } from 'lucide-react';
import api from '../../api/api';

interface LogEntry {
    _id: string;
    date: string;
    action: string;
    details: string;
    admin?: { firstname: string; lastname: string };
    article?: { title: string };
    user?: { email: string };
}

const AdminLogs = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/logs');
                setLogs(res.data.data.logs);
            } catch (err) {
                console.error("Erreur logs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    // Fonction pour donner une couleur et une icône selon l'action
    const getActionStyle = (action: string) => {
        if (action.includes('CREATE')) return { color: 'text-green-600 bg-green-50', icon: <FileText size={14} /> };
        if (action.includes('DELETE') || action.includes('DISABLE')) return { color: 'text-red-600 bg-red-50', icon: <AlertCircle size={14} /> };
        if (action.includes('UPDATE')) return { color: 'text-blue-600 bg-blue-50', icon: <History size={14} /> };
        return { color: 'text-gray-600 bg-gray-50', icon: <Shield size={14} /> };
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-zen-sage" size={40} /></div>;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Journal d'Audit</h1>
                <p className="text-gray-500">Historique complet des actions administratives et système.</p>
            </header>

            <div className="bg-white rounded-zen shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Date</th>
                            <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Action</th>
                            <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Admin</th>
                            <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Cible / Détails</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {logs.map((log) => {
                            const style = getActionStyle(log.action);
                            return (
                                <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-700">
                                                {new Date(log.date).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                <Clock size={10} /> {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${style.color}`}>
                                            {style.icon} {log.action.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-zen-sage/20 flex items-center justify-center text-[10px] font-bold text-zen-sage">
                                                {log.admin?.firstname?.[0]}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">
                                                {log.admin ? `${log.admin.firstname} ${log.admin.lastname}` : 'Système'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm">
                                            <p className="text-gray-600 italic">"{log.details}"</p>
                                            {log.article && (
                                                <span className="text-[10px] text-zen-sage font-bold bg-zen-sage/10 px-2 py-0.5 rounded mt-1 inline-block">
                                                    Article: {log.article.title}
                                                </span>
                                            )}
                                            {log.user && (
                                                <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">
                                                    User: {log.user.email}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminLogs;