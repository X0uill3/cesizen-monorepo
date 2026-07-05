import {
    LayoutDashboard, BookOpen, PenTool, Users, User,
    ShieldCheck, LogOut, Settings, BarChart3, Sticker, Library
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const allItems = [
        // --- SECTION UTILISATEUR & ADMIN ---
        { icon: <LayoutDashboard size={20} />, label: 'Tableau de bord', path: '/', roles: ['USER', 'ADMIN'] },
        { icon: <PenTool size={20} />, label: 'Mon Journal', path: '/journal', roles: ['USER', 'ADMIN'] },
        { icon: <BookOpen size={20} />, label: 'Bibliothèque Santé', path: '/library', roles: ['USER', 'ADMIN', 'GUEST'] },

        // --- SECTION STATS (Accessible aux deux, mais contenu différent) ---
        { icon: <BarChart3 size={20} />, label: 'Mes Analyses', path: '/stats', roles: ['USER', 'ADMIN'] },

        // --- SECTION ADMIN ONLY ---
        { icon: <Users size={20} />, label: 'Gestion Utilisateurs', path: '/admin/users', roles: ['ADMIN'] },
        { icon: <BookOpen size={20} />, label: 'Gestion Articles', path: '/admin/articles', roles: ['ADMIN'] },
        { icon: <Sticker size={20} />, label: 'Gestion Émotions', path: '/admin/emotions', roles: ['ADMIN'] },
        { icon: <Library size={20} />, label: 'Gestion Diagnostics', path: '/admin/diagnostics', roles: ['ADMIN'] },
        { icon: <ShieldCheck size={20} />, label: 'Logs Sécurité', path: '/admin/logs', roles: ['ADMIN'] },

        { icon: <Settings size={20} />, label: 'Paramètres', path: '/settings', roles: ['ADMIN'] },
    ];

    const menuItems = allItems.filter(item => item.roles.includes(user?.role || ''));

    return (
        <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col p-6 fixed left-0 top-0 shadow-sm">
            {/* LOGO CESIZen */}
            <div className="mb-10 px-2">
                <h1 className="text-2xl font-bold text-zen-sage tracking-tighter">CESIZen</h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Santé & Bien-être</p>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 space-y-2 overflow-y-auto">
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={index}
                            to={item.path}
                            className={`flex items-center gap-3 p-3 rounded-zen transition-all group ${isActive
                                ? 'bg-zen-sage text-white shadow-lg shadow-zen-sage/20'
                                : 'text-gray-500 hover:bg-zen-sage/10 hover:text-zen-sage'
                                }`}
                        >
                            <span className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-zen-sage'}>
                                {item.icon}
                            </span>
                            <span className="font-semibold text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* FOOTER : PROFIL & LOGOUT */}
            <div className="pt-6 border-t border-gray-50">
                {user ? (
                    /* BLOC CONNECTÉ */
                    <div className="flex items-center gap-3 mb-4 p-2 bg-zen-cream/50 rounded-zen border border-zen-sage/10">
                        <div className="w-10 h-10 rounded-full bg-zen-sage/20 flex items-center justify-center text-zen-sage font-bold">
                            {user?.firstname?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-800 truncate">
                                {user?.firstname} {user?.lastname}
                            </p>
                            <p className="text-[10px] text-zen-sage uppercase font-bold tracking-tight">
                                {user?.role === 'ADMIN' ? '🛠️ Administrateur' : '🌱 Membre'}
                            </p>
                        </div>
                    </div>
                ) : (
                    /* BLOC INVITÉ */
                    <div className="flex items-center gap-3 mb-4 p-2 bg-gray-50 rounded-zen border border-dashed border-gray-200">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <User size={18} /> {/* Ou un point d'interrogation */}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-500">Mode Invité</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">
                                Accès limité
                            </p>
                        </div>
                    </div>
                )}

                <button
                    onClick={logout}
                    className="flex items-center gap-3 p-3 w-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-zen cursor-pointer font-bold text-xs uppercase"
                >
                    <LogOut size={18} />
                    <span>Se déconnecter</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;