import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  obtenerTicketsService,
  actualizarPrioridadService,
  asignarTicketService
} from '../services/ticketService';
import {
  obtenerAgentesActivosService,
  obtenerNotificacionesService
} from '../services/userService';
import CreateTicketModal from '../components/tickets/CreateTicketModal';
import TicketDetailModal from '../components/tickets/TicketDetailModal';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [orden, setOrden] = useState('fecha');

  // HU09: Estados para búsqueda por texto y filtros combinados
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('Todas');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Cargar tickets desde la API (el backend filtra automáticamente por rol para Solicitantes)
  const cargarTickets = useCallback(async () => {
    try {
      setCargando(true);
      setError('');
      const data = await obtenerTicketsService(token);
      setTickets(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setCargando(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      cargarTickets();

      if (user?.rol === 'Coordinador') {
        obtenerAgentesActivosService(token)
          .then(setAgentes)
          .catch((err) => console.error('Error cargando agentes:', err));
      }

      obtenerNotificacionesService(token)
        .then(setNotificaciones)
        .catch((err) => console.error('Error cargando notificaciones:', err));
    }
  }, [token, user, cargarTickets]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTicketCreated = () => {
    cargarTickets();
  };

  const handleTicketUpdated = async () => {
    const updatedTickets = await cargarTickets();
    if (updatedTickets && selectedTicket) {
      const refreshed = updatedTickets.find((t) => t._id === selectedTicket._id);
      if (refreshed) {
        setSelectedTicket(refreshed);
      }
    }
  };

  const handleCambiarPrioridad = async (ticketId, nuevaPrioridad) => {
    try {
      await actualizarPrioridadService(ticketId, nuevaPrioridad, token);
      cargarTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAsignarAgente = async (ticketId, agenteId) => {
    if (!agenteId) return;
    try {
      await asignarTicketService(ticketId, agenteId, token);
      cargarTickets();
    } catch (err) {
      alert(err.message);
    }
  };

  // HU09: Resetear todos los filtros
  const handleLimpiarFiltros = () => {
    setBusquedaTexto('');
    setFiltroEstado('Todos');
    setFiltroPrioridad('Todas');
    setFiltroCategoria('Todas');
  };

  // HU09: Filtrado Combinado Dinámico (Texto, Estado, Prioridad, Categoría)
  const ticketsFiltrados = tickets.filter((t) => {
    const termino = busquedaTexto.toLowerCase().trim();

    // 1. Filtro por texto en título o descripción
    const coincideTexto =
      termino === '' ||
      (t.titulo && t.titulo.toLowerCase().includes(termino)) ||
      (t.descripcion && t.descripcion.toLowerCase().includes(termino));

    // 2. Filtro por estado
    const coincideEstado = filtroEstado === 'Todos' || t.estado === filtroEstado;

    // 3. Filtro por prioridad
    const coincidePrioridad = filtroPrioridad === 'Todas' || t.prioridad === filtroPrioridad;

    // 4. Filtro por categoría
    const coincideCategoria = filtroCategoria === 'Todas' || t.categoria === filtroCategoria;

    return coincideTexto && coincideEstado && coincidePrioridad && coincideCategoria;
  });

  // Ordenamiento dinámico
  const ticketsOrdenados = [...ticketsFiltrados].sort((a, b) => {
    if (orden === 'prioridad') {
      const pesoPrioridad = { Crítica: 4, Alta: 3, Media: 2, Baja: 1 };
      return pesoPrioridad[b.prioridad] - pesoPrioridad[a.prioridad];
    }
    if (orden === 'estado') {
      return a.estado.localeCompare(b.estado);
    }
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  // Métricas globales
  const pendientes = tickets.filter((t) => t.estado === 'Nuevo').length;
  const enAtencion = tickets.filter((t) => t.estado === 'En Proceso').length;
  const resueltos = tickets.filter((t) => t.estado === 'Resuelto' || t.estado === 'Cerrado').length;

  return (
    <div style={styles.container}>
      {/* Header */}
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

      {/* Navegación según rol */}
      <nav style={styles.nav}>
        <span style={styles.navActive}>Panel Principal</span>
        {(user?.rol === 'Coordinador' || user?.rol === 'Auditor') && (
          <Link to="/indicadores" style={styles.navLink}>
            Indicadores
          </Link>
        )}
        {user?.rol === 'Auditor' && (
          <Link to="/auditoria" style={styles.navLink}>
            Vista de Auditoría
          </Link>
        )}
      </nav>

      <main style={styles.content}>
        {/* Banner de Notificaciones HU05 */}
        {notificaciones.length > 0 && (
          <div style={styles.notificationBanner}>
            <strong style={{ display: 'block', marginBottom: '0.25rem' }}>🔔 Notificaciones Recientes:</strong>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              {notificaciones.slice(-3).reverse().map((n, idx) => (
                <li key={idx}>
                  {n.mensaje} <small style={{ color: '#64748b' }}>({new Date(n.fecha).toLocaleString()})</small>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tarjetas de Métricas */}
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

        {/* Sección de Gestión de Solicitudes y Panel de Filtros Combinados (HU09) */}
        <section style={styles.section}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={styles.sectionHeader}>
              <h2>Gestión de Solicitudes</h2>

              {(user?.rol === 'Solicitante' || !user?.rol) && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  style={styles.actionBtn}
                >
                  + Nueva Solicitud
                </button>
              )}
            </div>

            {/* Panel de Búsqueda y Filtros Combinados HU09 */}
            <div style={styles.filterBar}>
              <input
                type="text"
                placeholder="🔍 Buscar por título o descripción..."
                value={busquedaTexto}
                onChange={(e) => setBusquedaTexto(e.target.value)}
                style={styles.searchInput}
              />

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                style={styles.selectFilter}
              >
                <option value="Todos">Estado: Todos</option>
                <option value="Nuevo">Nuevo</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Resuelto">Resuelto</option>
                <option value="Cerrado">Cerrado</option>
              </select>

              <select
                value={filtroPrioridad}
                onChange={(e) => setFiltroPrioridad(e.target.value)}
                style={styles.selectFilter}
              >
                <option value="Todas">Prioridad: Todas</option>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>

              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                style={styles.selectFilter}
              >
                <option value="Todas">Categoría: Todas</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Redes">Redes</option>
                <option value="Acceso/Seguridad">Acceso/Seguridad</option>
                <option value="Otros">Otros</option>
              </select>

              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                style={styles.selectSort}
              >
                <option value="fecha">Orden: Fecha</option>
                <option value="prioridad">Orden: Prioridad</option>
                <option value="estado">Orden: Estado</option>
              </select>

              <button onClick={handleLimpiarFiltros} style={styles.clearFiltersBtn}>
                Limpiar Filtros
              </button>
            </div>
          </div>

          {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

          {cargando ? (
            <div style={styles.loadingContainer}>
              <p>Cargando solicitudes...</p>
            </div>
          ) : ticketsOrdenados.length === 0 ? (
            <div style={styles.tablePlaceholder}>
              <p>No se encontraron tickets que coincidan con los filtros aplicados.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Título</th>
                    <th style={styles.th}>Categoría</th>
                    <th style={styles.th}>Prioridad</th>
                    <th style={styles.th}>Agente Asignado</th>
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
                        {user?.rol === 'Coordinador' ? (
                          <select
                            value={ticket.agenteAsignado?._id || ''}
                            onChange={(e) => handleAsignarAgente(ticket._id, e.target.value)}
                            style={styles.selectPriority}
                          >
                            <option value="">-- Sin Asignar --</option>
                            {agentes.map((agente) => (
                              <option key={agente._id} value={agente._id}>
                                {agente.nombre}
                              </option>
                            ))}
                          </select>
                        ) : (
                          ticket.agenteAsignado?.nombre || (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin asignar</span>
                          )
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

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onCommentAdded={handleTicketUpdated}
        onStatusChanged={handleTicketUpdated}
      />
    </div>
  );
}

const statusBadgeStyle = (estado) => ({
  backgroundColor:
    estado === 'Nuevo'
      ? '#2563eb'
      : estado === 'En Proceso'
      ? '#d97706'
      : estado === 'Resuelto'
      ? '#16a34a'
      : '#64748b',
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
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
  header: { backgroundColor: '#1e293b', color: '#ffffff', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, fontSize: '1.4rem' },
  userInfo: { margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#94a3b8' },
  badge: { backgroundColor: '#2563eb', color: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  nav: { backgroundColor: '#ffffff', padding: '0.75rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem' },
  navActive: { fontWeight: 'bold', color: '#2563eb', borderBottom: '2px solid #2563eb', paddingBottom: '0.25rem' },
  navLink: { color: '#64748b', textDecoration: 'none', fontWeight: '500' },
  content: { maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' },
  notificationBanner: { backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.5rem', color: '#1e3a8a', fontSize: '0.875rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  card: { backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardTitle: { margin: 0, fontSize: '0.875rem', color: '#64748b' },
  cardValue: { margin: '0.5rem 0 0', fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a' },
  section: { backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  filterBar: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '6px' },
  searchInput: { padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', minWidth: '200px', flex: '1' },
  selectFilter: { padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff', cursor: 'pointer' },
  selectSort: { padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff', cursor: 'pointer' },
  clearFiltersBtn: { padding: '0.4rem 0.8rem', backgroundColor: '#64748b', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '500' },
  actionBtn: { backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  selectPriority: { padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' },
  loadingContainer: { padding: '2rem', textAlign: 'center', color: '#64748b' },
  tablePlaceholder: { padding: '3rem', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '6px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.875rem', fontWeight: '600' },
  td: { padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem', color: '#334155' },
  tr: { transition: 'background-color 0.2s' },
  detailBtn: { backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500' }
};