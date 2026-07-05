import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Journal from './pages/Journal';
import Library from './pages/Library';
import ArticleDetail from './pages/ArticleDetail';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

import AdminDiagnostics from './pages/admin/AdminDiagnostics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminArticles from './pages/admin/AdminArticles';
import AdminLogs from './pages/admin/AdminLogs';
import AdminEmotions from './pages/admin/AdminEmotions';
import PublicLayout from './layouts/PublicLayout';


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes sans sidebar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes publiques avec sidebar */}
          <Route element={<PublicLayout />}>
            <Route path="/library" element={<Library />} />
            <Route path="/bibliotheque/:id" element={<ArticleDetail />} />
          </Route>

          {/* Routes protégées avec sidebar */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/stats" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />

            <Route element={<AdminRoute />}>
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/articles" element={<AdminArticles />} />
              <Route path="/admin/diagnostics" element={<AdminDiagnostics />} />
              <Route path="/admin/logs" element={<AdminLogs />} />
              <Route path="/admin/emotions" element={<AdminEmotions />} />
            </Route>
          </Route>

          {/* On redirige vers l'accueil ou login par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}