import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import pour l'auto-login
import api from '../api/api';
import { Lock, Mail, Loader2, Calendar } from 'lucide-react';
import { getErrorMessage } from '../utils/errors';

const Register = () => {
    const { login } = useAuth(); // Pour connecter l'utilisateur direct après inscription
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        birthdate: '' // Ajouté pour matcher ton controller
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.post('/auth/signup', formData);
            const { token, data } = response.data;
            login(data.user, token);
            navigate('/');
        } catch (err) {
            setError(getErrorMessage(err, "Erreur lors de la création du compte."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zen-cream flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-zen shadow-xl p-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-zen-sage">Créer un compte</h1>
                    <p className="text-gray-400 mt-2">Rejoignez l'aventure CESIZen</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-500 rounded-lg text-sm italic border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            name="firstname"
                            placeholder="Prénom"
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-zen-sage/20"
                        />
                        <input
                            name="lastname"
                            placeholder="Nom"
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-50 border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-zen-sage/20"
                        />
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-300" size={18} />
                        <input
                            name="email"
                            type="email"
                            placeholder="Email"
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-50 border-none rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-zen-sage/20"
                        />
                    </div>

                    {/* CHAMP BIRTHDATE AJOUTÉ */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 text-gray-300" size={18} />
                        <input
                            name="birthdate"
                            type="date"
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-50 border-none rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-zen-sage/20 text-gray-500"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-300" size={18} />
                        <input
                            name="password"
                            type="password"
                            placeholder="Mot de passe"
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-50 border-none rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-zen-sage/20"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-zen-sage text-white font-bold py-4 rounded-xl shadow-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : "C'est parti !"}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-400">
                    Déjà inscrit ? <Link to="/login" className="text-zen-sage font-bold underline">Se connecter</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;