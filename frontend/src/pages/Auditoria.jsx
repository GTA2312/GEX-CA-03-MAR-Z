import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { obtenerHistorialAuditoriaService } from '../services/ticketService';

export default function Auditoria() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [auditoriaLogs, setAuditoriaLogs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('Todas');

  useEffect(() => {
    if (token) {
      obtenerHistorialAuditoriaService(token)
        .then((data) => {
          setAuditoriaLogs(Array.isArray(data) ? data : []);
          setCargando(false);
        })
        .catch((err) => {
          setError(err.message);
          setCargando(false);
        });
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Inspección profunda (Acción + Detalle) para clasificar dinámicamente cada evento
  const normalizarLog = (log) => {
    const accionRaw = (log.accion || log.tipoAccion || log.tipo || log.evento || log.action || '').toString();
    const detalleRaw = (log.detalle || log.descripcion || log.mensaje || log.detalles || '').toString();

    const textoAnalizar = `${accionRaw} ${detalleRaw}`.toUpperCase();

    let accionTexto = '';

    if (textoAnalizar.includes('PRIORIDAD') || textoAnalizar.includes('PRIO')) {
      accionTexto = 'Cambio de Prioridad';
    } else if (textoAnalizar.includes('ASIGNA') || textoAnalizar.includes('ASIG')) {
      accionTexto = 'Asignación';
    } else if (
      textoAnalizar.includes('ESTADO') ||
      textoAnalizar.includes('PROCESO') ||
      textoAnalizar.includes('RESUELTO') ||
      textoAnalizar.includes('CERRADO')
    ) {
      accionTexto = 'Cambio de Estado';
    } else if (textoAnalizar.includes('COMENT') || textoAnalizar.includes('NOTA')) {
      accionTexto = 'Comentario';
    } else if (
      textoAnalizar.includes('REAPER') ||
      textoAnalizar.includes('REABR') ||
      textoAnalizar.includes('REABIERTO')
    ) {
      accionTexto = 'Reapertura';
    } else if (
      textoAnalizar.includes('CREA') ||
      textoAnalizar.includes('NUEVO') ||
      textoAnalizar.includes('REGISTR')
    ) {
      accionTexto = 'Creación';
    } else {
      accionTexto = accionRaw.trim() !== '' ? accionRaw : 'General';
    }

    const detalle = detalleRaw || 'Registro de evento en el sistema';
    const actorCodificado = log.actorCodificado || log.actor || log.usuarioCodificado || 'ACTOR-MASKED';

    let ticketLabel = 'N/A';
    if (log.ticketTitulo) {
      ticketLabel = log.ticketTitulo;
    } else if (typeof log.ticketId === 'object' && log.ticketId !== null) {
      ticketLabel = log.ticketId.titulo || log.ticketId._id || 'N/A';
    } else if (log.ticketId) {
      ticketLabel = log.ticketId;
    }

    return { accionRaw, accionTexto, detalle, actorCodificado, ticketLabel };
  };

  // Filtrado reactivo sobre las acciones normalizadas
  const logsFiltrados = auditoriaLogs.filter((log) => {
    const norm = normalizarLog(log);
    const termino = busqueda.toLowerCase().trim();

    const coincideTexto =
      termino === '' ||
      norm.ticketLabel.toLowerCase().includes(termino) ||
      norm.actorCodificado.toLowerCase().includes(termino) ||
      norm.detalle.toLowerCase().includes(termino) ||
      norm.accionTexto.toLowerCase().includes(termino) ||
      norm.accionRaw.toLowerCase().includes(termino);

    const coincideAccion =
      filtroAccion === 'Todas' ||
      norm.accionTexto === filtroAccion ||
      norm.accionRaw.toUpperCase().includes(filtroAccion.toUpperCase());

    return coincideTexto && coincideAccion;
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Módulo de Auditoría de Traza — MAR-Z</h1>
          <p style={styles.userInfo}>
            Auditor: <strong>{user?.nombre}</strong> | Rol: <span style={styles.badge}>{user?.rol}</span>
          </p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Cerrar Sesión
        </button>
      </header>

      {/* Navegación */}
      <nav style={styles.nav}>
        <Link to="/dashboard" style={styles.navLink}>
          ← Volver al Panel Principal
        </Link>
        <Link to="/indicadores" style={styles.navLink}>
          Indicadores Agregados
        </Link>
        <span style={styles.navActive}>Vista de Auditoría</span>
      </nav>

      <main style={styles.content}>
        {/* Banner Informativo */}
        <div style={styles.infoBanner}>
          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>🛡️ Regla de Enmascaramiento de Datos:</strong>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            Los identificadores de usuario han sido anonimizados (<strong>Actor Codificado</strong>) para cumplir con el protocolo de auditoría e imparcialidad.
          </p>
        </div>

        {/* Historial de Registros */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Historial de Eventos del Sistema</h2>

            {/* Buscador y Filtro por Acción */}
            <div style={styles.filterGroup}>
              <input
                type="text"
                placeholder="🔍 Buscar por Ticket, Actor o Detalle..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={styles.searchInput}
              />

              <select
                value={filtroAccion}
                onChange={(e) => setFiltroAccion(e.target.value)}
                style={styles.selectFilter}
              >
                <option value="Todas">Acción: Todas</option>
                <option value="Creación">Creación</option>
                <option value="Cambio de Estado">Cambio de Estado</option>
                <option value="Asignación">Asignación</option>
                <option value="Cambio de Prioridad">Cambio de Prioridad</option>
                <option value="Comentario">Comentario</option>
                <option value="Reapertura">Reapertura</option>
              </select>
            </div>
          </div>

          {error && <p style={styles.errorText}>{error}</p>}

          {cargando ? (
            <div style={styles.centerContainer}>
              <p>Cargando registros de traza...</p>
            </div>
          ) : logsFiltrados.length === 0 ? (
            <div style={styles.placeholderBox}>
              <p>No se encontraron registros de auditoría que coincidan con los criterios.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Fecha / Hora</th>
                    <th style={styles.th}>Ticket / Solicitud</th>
                    <th style={styles.th}>Acción</th>
                    <th style={styles.th}>Actor Codificado</th>
                    <th style={styles.th}>Detalle del Evento</th>
                  </tr>
                </thead>
                <tbody>
                  {logsFiltrados.map((log, index) => {
                    const norm = normalizarLog(log);
                    return (
                      <tr key={log._id || index} style={styles.tr}>
                        <td style={styles.td}>
                          {new Date(log.fecha || log.createdAt || Date.now()).toLocaleString()}
                        </td>
                        <td style={styles.td}>
                          <strong>{norm.ticketLabel}</strong>
                        </td>
                        <td style={styles.td}>
                          <span style={actionBadgeStyle(norm.accionTexto)}>
                            {norm.accionTexto}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <code style={styles.actorCode}>{norm.actorCodificado}</code>
                        </td>
                        <td style={styles.td}>{norm.detalle}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const actionBadgeStyle = (accionTexto) => {
  const colors = {
    'Creación': '#2563eb',
    'Cambio de Estado': '#d97706',
    'Asignación': '#7c3aed',
    'Cambio de Prioridad': '#dc2626',
    'Comentario': '#475569',
    'Reapertura': '#ea580c'
  };
  return {
    backgroundColor: colors[accionTexto] || '#64748b',
    color: '#ffffff',
    padding: '0.25rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    display: 'inline-block',
    whiteSpace: 'nowrap'
  };
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
  header: { backgroundColor: '#1e293b', color: '#ffffff', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, fontSize: '1.3rem' },
  userInfo: { margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#94a3b8' },
  badge: { backgroundColor: '#2563eb', color: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  nav: { backgroundColor: '#ffffff', padding: '0.75rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem', alignItems: 'center' },
  navActive: { fontWeight: 'bold', color: '#2563eb', borderBottom: '2px solid #2563eb', paddingBottom: '0.25rem' },
  navLink: { color: '#64748b', textDecoration: 'none', fontWeight: '500' },
  content: { maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' },
  infoBanner: { backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.5rem', color: '#14532d' },
  section: { backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' },
  filterGroup: { display: 'flex', gap: '10px', alignItems: 'center' },
  searchInput: { padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '250px' },
  selectFilter: { padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff', cursor: 'pointer' },
  centerContainer: { padding: '2rem', textAlign: 'center', color: '#64748b' },
  placeholderBox: { padding: '3rem', textAlign: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '6px' },
  errorText: { color: '#ef4444', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.85rem', fontWeight: '600' },
  td: { padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem', color: '#334155' },
  tr: { transition: 'background-color 0.2s' },
  actorCode: { backgroundColor: '#e2e8f0', color: '#1e293b', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'monospace' }
};