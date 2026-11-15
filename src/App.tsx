import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './routes/index';
import VisaoAnual from './routes/visao-anual';
import Perfil from './routes/perfil';
import Auth from './routes/auth';
import { Layout } from './components/ui/layout';
import { AuthProvider, useAuth } from './hooks/use-auth';

// Componente para proteger as páginas (Dashboard, etc.)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Se tentar ir para o login já estando logado, envia para a Dashboard */}
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />

      {/* Rotas Privadas protegidas */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/visao-anual" element={<ProtectedRoute><VisaoAnual /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;