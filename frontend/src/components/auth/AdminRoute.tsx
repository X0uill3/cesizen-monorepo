import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GlobalRole } from '../../constants/roles';

const AdminRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (!user || user.role !== GlobalRole.ADMIN) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;