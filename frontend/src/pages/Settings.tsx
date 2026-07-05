import React, { useState } from 'react';
import { User, Lock, Bell, Moon, Trash2, Save, Loader2, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { href } from 'react-router-dom';

const Settings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // États pour les formulaires
    const [profileData, setProfileData] = useState({
        firstname: user?.firstname || '',
        lastname: user?.lastname || '',
        email: user?.email || ''
    });

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.patch('/users/updateMe', profileData);
            alert("Profil mis à jour ! ✨");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.new !== passwords.confirm) {
            return alert("Les nouveaux mots de passe ne correspondent pas ! ❌");
        }

        setLoading(true);
        try {
            await api.patch('/users/updateMyPassword', {
                passwordCurrent: passwords.current,
                password: passwords.new,
                passwordConfirm: passwords.confirm
            });

            setPasswords({ current: '', new: '', confirm: '' });
            alert("Mot de passe mis à jour !");
        } catch (err: any) {
            alert(err.response?.data?.message || "Erreur lors du changement de mot de passe");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
            return;
        }
        setLoading(true);
        try {
            await api.delete('/users/deleteMe');
            alert("Votre compte a été supprimé. Nous sommes désolés de vous voir partir.");
            href('/');
        } catch (err: any) {
            alert(err.response?.data?.message || "Erreur lors de la suppression du compte");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">Configuration</h1>
                <p className="text-gray-500">Gérez vos informations et vos préférences de compte.</p>
            </header>

            <section className="bg-white rounded-zen border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                    <User className="text-zen-sage" size={20} />
                    <h2 className="font-bold text-gray-800">Informations Personnelles</h2>
                </div>
                <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                    <div className="flex flex-col md:flex-row gap-8 items-center mb-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-zen-sage/10 flex items-center justify-center text-3xl font-bold text-zen-sage border-4 border-white shadow-md">
                                {user?.firstname[0]}{user?.lastname[0]}
                            </div>
                            <button type="button" className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg text-gray-400 hover:text-zen-sage transition-colors">
                                <Camera size={16} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-400 max-w-xs">Cliquez sur l'icône pour modifier votre photo de profil. Formats acceptés : JPG, PNG.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Prénom</label>
                            <input
                                type="text"
                                value={profileData.firstname}
                                onChange={e => setProfileData({ ...profileData, firstname: e.target.value })}
                                className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-zen-sage/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nom</label>
                            <input
                                type="text"
                                value={profileData.lastname}
                                onChange={e => setProfileData({ ...profileData, lastname: e.target.value })}
                                className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-zen-sage/20"
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="bg-zen-sage text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all ml-auto">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Enregistrer les modifications
                    </button>
                </form>
            </section>

            <section className="bg-white rounded-zen border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                    <Lock className="text-zen-sky" size={20} />
                    <h2 className="font-bold text-gray-800">Sécurité</h2>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <input
                            type="password"
                            placeholder="Mot de passe actuel"
                            value={passwords.current}
                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                            className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-zen-sky/20"
                        />
                        <input
                            type="password"
                            placeholder="Nouveau mot de passe"
                            value={passwords.new}
                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                            className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-zen-sky/20"
                        />
                        <input
                            type="password"
                            placeholder="Confirmer"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-zen-sky/20"
                        />
                    </div>
                    <button type="submit" disabled={loading} onClick={handleChangePassword} className="text-zen-sky font-bold text-sm hover:underline">Mettre à jour le mot de passe</button>
                </div>
            </section>


            <section className="pt-10 border-t border-gray-100">
                <div className="flex items-center justify-between p-6 bg-red-50 rounded-2xl border border-red-100">
                    <div>
                        <p className="font-bold text-red-600">Supprimer mon compte</p>
                        <p className="text-sm text-red-400">Cette action est irréversible. Toutes vos données seront effacées.</p>
                    </div>
                    <button className="bg-white text-red-600 px-6 py-3 rounded-xl font-bold border border-red-100 hover:bg-red-600 hover:text-white transition-all flex items-center gap-2" disabled={loading} onClick={handleDeleteAccount}>
                        <Trash2 size={18} /> Supprimer
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Settings;