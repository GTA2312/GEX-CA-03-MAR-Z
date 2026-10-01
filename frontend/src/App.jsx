import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketDetail from './pages/TicketDetail';
import Auditoria from './pages/Auditoria';
import Indicadores from './pages/Indicadores';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          {/* Navbar global */}
          <Routes>
            {/* Ruta Pública */}
            <Route path="/" element={<Login />} />

            {/* Rutas Protegidas Generales */}
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

            {/* Ruta Protegida para HU10 (Coordinador y Auditor) */}
            <Route
              path="/indicadores"
              element={
                <ProtectedRoute roles={['Coordinador', 'Auditor']}>
                  <Indicadores />
                </ProtectedRoute>
              }
            />

            {/* Ruta Protegida Exclusiva para Auditor (HU11) */}
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