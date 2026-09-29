import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketDetail from './pages/TicketDetail';
import Auditoria from './pages/Auditoria';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          {/* Navbar global (se puede agregar más adelante) */}
          <Routes>
            {/* Ruta Pública */}
            <Route path="/" element={<Login />} />

            {/* Rutas Protegidas (Requieren inicio de sesión) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ticket/:id"
              element={
                <ProtectedRoute>
                  <TicketDetail />
                </ProtectedRoute>
              }
            />

            {/* Ruta Protegida Exclusiva para el rol Auditor */}
            <Route
              path="/auditoria"
              element={
                <ProtectedRoute roles={['Auditor']}>
                  <Auditoria />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;