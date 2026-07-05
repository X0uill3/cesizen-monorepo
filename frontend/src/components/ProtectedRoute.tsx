import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WebLayout from '../layouts/WebLayout'; // On utilise le Layout, pas juste la Sidebar

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="h-screen flex items-center justify-center bg-zen-cream">Chargement...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <WebLayout>
            <Outlet />
        </WebLayout>
    );
};

export default ProtectedRoute;