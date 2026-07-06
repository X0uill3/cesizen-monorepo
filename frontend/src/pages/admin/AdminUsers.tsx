import React, { useEffect, useState } from 'react';
import { Ban, CheckCircle, Loader2 } from 'lucide-react';
import api from '../../api/api';

interface UserRow {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    role: string;
    systemStatus: string;
}

const AdminUsers = () => {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users'); // On imagine cette route côté back
            setUsers(res.data.data.users);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const toggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Enabled' ? 'Disabled' : 'Enabled';

        if (newStatus === 'Disabled') {
            try {
                await api.delete(`/users/${userId}`);
                fetchUsers();
            } catch { alert("Erreur lors du changement de statut"); }
        } else {
            try {
                await api.patch(`/users/${userId}/reactivate`);
                fetchUsers();
            } catch { alert("Erreur lors du changement de statut"); }
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-zen-sage" size={40} /></div>;

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
                <p className="text-gray-500">Supervisez les membres de la communauté CESIZen.</p>
            </header>

            <div className="bg-white rounded-zen shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Utilisateur</th>
                            <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Rôle</th>
                            <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Statut</th>
                            <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {users.map((u) => (
                            <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zen-sage/10 flex items-center justify-center text-zen-sage font-bold">
                                            {u.firstname[0]}{u.lastname[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{u.firstname} {u.lastname}</p>
                                            <p className="text-xs text-gray-400">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {u.systemStatus === 'Enabled' ? (
                                            <CheckCircle size={16} className="text-green-500" />
                                        ) : (
                                            <Ban size={16} className="text-red-500" />
                                        )}
                                        <span className="text-sm font-medium">{u.systemStatus}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => toggleStatus(u._id, u.systemStatus)}
                                        className={`p-2 rounded-lg transition-colors ${u.systemStatus === 'Enabled' ? 'text-red-400 hover:bg-red-50' : 'text-green-400 hover:bg-green-50'}`}
                                        title={u.systemStatus === 'Enabled' ? 'Bannir' : 'Réactiver'}
                                    >
                                        {u.systemStatus === 'Enabled' ? <Ban size={18} /> : <CheckCircle size={18} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;