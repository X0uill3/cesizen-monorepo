import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
// Import du nouveau composant
import EmotionModal from '../components/EmotionModal';
import WeeklyStats from '../components/WeeklyStats';
import api from '../api/api';

interface Article {
    _id: string;
    title: string;
    content: string;
    category: string;
    imageUrl?: string;
    author: { firstname: string; lastname: string };
    publishedAt: string;
}

const Dashboard = () => {
    const { user } = useAuth();
    const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    // État pour gérer l'ouverture du Modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await api.get('/articles');
                // On suit ta structure : res.data.data.articles
                setRecommendedArticles(res.data.data.articles);
            } catch (err) {
                console.error("Erreur chargement articles", err);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    return (
        <div className="space-y-10">
            {/* 1. Header de bienvenue */}
            <header>
                <h1 className="text-3xl font-bold text-gray-800">
                    Bonjour, <span className="text-zen-sage">{user?.firstname || 'Enzo'}</span> ✨
                </h1>
                <p className="text-gray-500 mt-2">Prenez un moment pour respirer. Comment vous sentez-vous aujourd'hui ?</p>
            </header>

            {/* 2. Grille de statistiques et actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Carte : Tracker d'émotion rapide */}
                <div className="lg:col-span-2 bg-white p-8 rounded-zen shadow-sm border border-gray-50 flex flex-col justify-between">
                    <div>
                        <div className="bg-zen-sage/10 w-12 h-12 rounded-full flex items-center justify-center text-zen-sage mb-6">
                            <Heart size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Suivi de l'humeur</h2>
                        <p className="text-gray-500">Enregistrez votre état d'esprit pour suivre votre évolution au fil des semaines.</p>
                    </div>

                    {/* LE BOUTON QUI OUVRE LE MODAL */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-8 bg-zen-sage text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 self-start hover:bg-opacity-90 transition-all active:scale-95"
                    >
                        Noter mon émotion <ArrowRight size={18} />
                    </button>
                </div>

                {/* NOUVEAU : Graphique (Prend 1 colonne) */}
                <div className="lg:col-span-1">
                    <WeeklyStats />
                </div>

                {/* Carte : Citation (On peut la mettre en dessous maintenant) */}
                <div className="lg:col-span-3 bg-zen-sky/20 p-8 rounded-zen flex items-center justify-between">
                    <div className="flex gap-4 items-center">
                        <span className="text-4xl">🌿</span>
                        <blockquote className="italic text-zen-dark font-medium max-w-md">
                            "Le bonheur n'est pas quelque chose de tout fait. Il vient de vos propres actions."
                        </blockquote>
                    </div>
                    <cite className="text-xs uppercase tracking-widest text-gray-400 not-italic">— Dalai Lama</cite>
                </div>

            </div>

            {/* 3. Section Articles récents */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Sélection pour vous</h2>
                    <Link to="/library" className="text-zen-sage font-bold text-sm flex items-center gap-1 hover:underline">
                        Tout voir <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center text-gray-400">Chargement des articles...</div>
                    ) : recommendedArticles.length > 0 ? (
                        recommendedArticles.map(article => (
                            <ArticleCard key={article._id} title={article.title} category={article.category} author={article.author} />
                        ))
                    ) : (
                        <div className="col-span-full text-center text-gray-400">Aucun article recommandé</div>
                    )}
                </div>
            </section>

            {/* COMPOSANT MODAL (Caché par défaut) */}
            <EmotionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

// Petit composant interne pour les cartes d'articles
const ArticleCard = ({ title, category, author }: { title: string, category: string, author: { firstname: string, lastname: string } }) => (
    <div className="bg-white p-6 rounded-zen border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
        <div className="text-[10px] font-bold uppercase tracking-widest text-zen-sage mb-2">{category}</div>
        <h3 className="font-bold text-gray-800 group-hover:text-zen-sage transition-colors">{title}</h3>
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
            <User size={14} /> {author.firstname} {author.lastname}
        </div>
    </div>
);

export default Dashboard;