import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 1. Appel au backend
            const response = await api.post('/auth/login', { email, password });

            // 2. Extraction des données (vérifie bien la structure de ta réponse backend)
            const { data, token } = response.data;

            // 3. Mise à jour du contexte global
            login(data.user, token);

            // 4. Redirection vers le dashboard
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Une erreur est survenue lors de la connexion.');
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zen-cream flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-zen shadow-xl shadow-zen-sage/5 p-10">
                {/* HEADER */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-zen-sage mb-2">CESIZen</h1>
                    <p className="text-gray-400">Heureux de vous revoir parmi nous.</p>
                </div>

                {/* FORMULAIRE */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-zen-sage/20 transition-all outline-none"
                                placeholder="votre@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Mot de passe</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-zen-sage/20 transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-zen-sage text-white font-bold py-4 rounded-xl shadow-lg shadow-zen-sage/20 hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Se connecter'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-400">
                        Vous n'avez pas de compte ?{' '}
                        <Link
                            to="/register"
                            className="text-zen-sage font-bold hover:underline transition-all"
                        >
                            S'inscrire
                        </Link>
                    </p>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-400">
                        Vous ne voulez pas de compte ?{' '}
                        <Link
                            to="/library"
                            className="text-zen-sage font-bold hover:underline transition-all"
                        >
                            Accéder aux ressources
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;