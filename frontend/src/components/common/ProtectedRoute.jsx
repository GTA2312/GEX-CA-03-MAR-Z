import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, token } = useAuth();

  // 1. Si no hay token de autenticación, redirige al Login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2. Si se especifican roles requeridos y el usuario no los cumple, redirige al Dashboard
  if (roles.length > 0 && !roles.includes(user?.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}