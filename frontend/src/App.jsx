import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importación de las páginas (Asegúrate de que estos archivos exporten un componente básico de React)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TicketDetail from './pages/TicketDetail';
import Auditoria from './pages/Auditoria';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Aquí luego puedes agregar un Navbar global */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ticket/:id" element={<TicketDetail />} />
          <Route path="/auditoria" element={<Auditoria />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;