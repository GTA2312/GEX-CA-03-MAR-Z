import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { obtenerTicketsService, actualizarPrioridadService } from '../services/ticketService';
import CreateTicketModal from '../components/tickets/CreateTicketModal';
import TicketDetailModal from '../components/tickets/TicketDetailModal';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [orden, setOrden] = useState('fecha');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Cargar tickets desde la API
  const cargarTickets = useCallback(async () => {
    try {
      setCargando(true);
      setError('');
      const data = await obtenerTicketsService(token);
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      cargarTickets();
    }
  }, [token, cargarTickets]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTicketCreated = () => {
    cargarTickets();
  };

  // HU04: Cambiar prioridad (Solo Coordinador)
  const handleCambiarPrioridad = async (ticketId, nuevaPrioridad) => {
    try {
      await actualizarPrioridadService(ticketId, nuevaPrioridad, token);
      cargarTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  // HU04: Lógica de ordenamiento dinámico
  const ticketsOrdenados = [...tickets].sort((a, b) => {
    if (orden === 'prioridad') {
      const pesoPrioridad = { Crítica: 4, Alta: 3, Media: 2, Baja: 1 };
      return pesoPrioridad[b.prioridad] - pesoPrioridad[a.prioridad];
    }
    if (orden === 'estado') {
      return a.estado.localeCompare(b.estado);
    }
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  // Cálculo de métricas
  const pendientes = tickets.filter((t) => t.estado === 'Nuevo').length;
  const enAtencion = tickets.filter((t) => t.estado === 'En Proceso').length;
  const resueltos = tickets.filter((t) => t.estado === 'Resuelto' || t.estado === 'Cerrado').length;

  return (
    <div style={styles.container}>
      {/* Barra Superior / Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Plataforma de Soporte MAR-Z</h1>
          <p style={styles.userInfo}>
            Bienvenido, <strong>{user?.nombre || 'Usuario'}</strong> | Rol:{' '}
            <span style={styles.badge}>{user?.rol || 'Solicitante'}</span>
          </p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Cerrar Sesión
        </button>
      </header>

      {/* Navegación rápida según rol */}
      <nav style={styles.nav}>
        <span style={styles.navActive}>Panel Principal</span>
        {user?.rol === 'Auditor' && (
          <Link to="/auditoria" style={styles.navLink}>
            Vista de Auditoría
          </Link>
        )}
      </nav>

      {/* Métricas dinámicas */}
      <main style={styles.content}>
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Pendientes</h3>
            <p style={styles.cardValue}>{pendientes}</p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>En Atención</h3>
            <p style={styles.cardValue}>{enAtencion}</p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Resueltos</h3>
            <p style={styles.cardValue}>{resueltos}</p>
          </div>
        </div>

        {/* Sección de Gestión de Solicitudes */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2>Gestión de Solicitudes</h2>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Desplegable de ordenamiento HU04 */}
              <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Ordenar por:</label>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                style={styles.selectSort}
              >
                <option value="fecha">Fecha (Última actualización)</option>
                <option value="prioridad">Prioridad (Crítica a Baja)</option>
                <option value="estado">Estado</option>
              </select>

              {(user?.rol === 'Solicitante' || !user?.rol) && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  style={styles.actionBtn}
                >
                  + Nueva Solicitud
                </button>
              )}
            </div>
          </div>

          {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

          {cargando ? (
            <div style={styles.loadingContainer}>
              <p>Cargando solicitudes...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div style={styles.tablePlaceholder}>
              <p>No se encontraron tickets registrados en el sistema.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Título</th>
                    <th style={styles.th}>Categoría</th>
                    <th style={styles.th}>Prioridad</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Última Actualización</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketsOrdenados.map((ticket) => (
                    <tr key={ticket._id} style={styles.tr}>
                      <td style={styles.td}>
                        <strong>{ticket.titulo}</strong>
                      </td>
                      <td style={styles.td}>{ticket.categoria}</td>
                      <td style={styles.td}>
                        {/* Selector editable solo para Coordinador (HU04) */}
                        {user?.rol === 'Coordinador' ? (
                          <select
                            value={ticket.prioridad}
                            onChange={(e) => handleCambiarPrioridad(ticket._id, e.target.value)}
                            style={styles.selectPriority}
                          >
                            <option value="Baja">Baja</option>
                            <option value="Media">Media</option>
                            <option value="Alta">Alta</option>
                            <option value="Crítica">Crítica</option>
                          </select>
                        ) : (
                          <span style={priorityBadgeStyle(ticket.prioridad)}>
                            {ticket.prioridad}
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={statusBadgeStyle(ticket.estado)}>
                          {ticket.estado}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {new Date(ticket.updatedAt).toLocaleString()}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          style={styles.detailBtn}
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Modal para HU02: Crear Solicitud */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />

      {/* Modal para HU03 / HU04: Ver Detalle y Trazabilidad */}
      <TicketDetailModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />
    </div>
  );
}

// Estilos de Badges
const statusBadgeStyle = (estado) => ({
  backgroundColor:
    estado === 'Nuevo' ? '#2563eb' : estado === 'En Proceso' ? '#d97706' : '#16a34a',
  color: '#ffffff',
  padding: '0.2rem 0.6rem',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 'bold'
});

const priorityBadgeStyle = (prioridad) => ({
  backgroundColor:
    prioridad === 'Crítica'
      ? '#dc2626'
      : prioridad === 'Alta'
      ? '#ea580c'
      : prioridad === 'Media'
      ? '#d97706'
      : '#16a34a',
  color: '#ffffff',
  padding: '0.2rem 0.6rem',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: 'bold'
});

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    padding: '1.25rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    margin: 0,
    fontSize: '1.4rem'
  },
  userInfo: {
    margin: '0.25rem 0 0',
    fontSize: '0.875rem',
    color: '#94a3b8'
  },
  badge: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  nav: {
    backgroundColor: '#ffffff',
    padding: '0.75rem 2rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    gap: '1.5rem'
  },
  navActive: {
    fontWeight: 'bold',
    color: '#2563eb',
    borderBottom: '2px solid #2563eb',
    paddingBottom: '0.25rem'
  },
  navLink: {
    color: '#64748b',
    textDecoration: 'none',
    fontWeight: '500'
  },
  content: {
    maxWidth: '1100px',
    margin: '2rem auto',
    padding: '0 1rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '1.25rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  cardTitle: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#64748b'
  },
  cardValue: {
    margin: '0.5rem 0 0',
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: '#0f172a'
  },
  section: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  actionBtn: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  selectSort: {
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  selectPriority: {
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  loadingContainer: {
    padding: '2rem',
    textAlign: 'center',
    color: '#64748b'
  },
  tablePlaceholder: {
    padding: '3rem',
    textAlign: 'center',
    color: '#94a3b8',
    border: '2px dashed #e2e8f0',
    borderRadius: '6px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '0.5rem'
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    borderBottom: '2px solid #e2e8f0',
    color: '#475569',
    fontSize: '0.875rem',
    fontWeight: '600'
  },
  td: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '0.875rem',
    color: '#334155'
  },
  tr: {
    transition: 'background-color 0.2s'
  },
  detailBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '500'
  }
};