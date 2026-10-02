import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { obtenerIndicadoresService } from '../services/ticketService';

export default function Indicadores() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [indicadores, setIndicadores] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Filtros reproducibles para segmentación local
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroPrioridad, setFiltroPrioridad] = useState('Todas');

  useEffect(() => {
    if (token) {
      obtenerIndicadoresService(token)
        .then((data) => {
          setIndicadores(data);
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

  if (cargando) {
    return (
      <div style={styles.centerContainer}>
        <p>Cargando indicadores agregados del servicio...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Panel de Indicadores Agregados — MAR-Z</h1>
          <p style={styles.userInfo}>
            Usuario: <strong>{user?.nombre}</strong> | Rol: <span style={styles.badge}>{user?.rol}</span>
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
        <span style={styles.navActive}>Indicadores Agregados</span>
        {user?.rol === 'Auditor' && (
          <Link to="/auditoria" style={styles.navLink}>
            Vista de Auditoría
          </Link>
        )}
      </nav>

      <main style={styles.content}>
        {error && <p style={styles.errorText}>{error}</p>}

        {/* Métrica Destacada: Tiempo Mediano de Ciclo */}
        <div style={styles.highlightBanner}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a8a' }}>
              ⏱️ Tiempo Mediano de Ciclo de Resolución
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#3b82f6' }}>
              Mediana de tiempo transcurrido desde la apertura de una solicitud hasta su resolución/cierre.
            </p>
          </div>
          <div style={styles.medianValueBox}>
            <span style={styles.medianNumber}>
              {indicadores?.tiempoMedianoCicloHoras ?? 0}
            </span>
            <span style={styles.medianUnit}>Horas</span>
          </div>
        </div>

        {/* Resumen de Tarjetas */}
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Total Solicitudes Registradas</h3>
            <p style={styles.cardValue}>{indicadores?.totalSolicitudes || 0}</p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Nuevas (Sin Atención)</h3>
            <p style={{ ...styles.cardValue, color: '#2563eb' }}>
              {indicadores?.volumenPorEstado?.Nuevo || 0}
            </p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>En Proceso</h3>
            <p style={{ ...styles.cardValue, color: '#d97706' }}>
              {indicadores?.volumenPorEstado?.['En Proceso'] || 0}
            </p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Resueltas / Cerradas</h3>
            <p style={{ ...styles.cardValue, color: '#16a34a' }}>
              {(indicadores?.volumenPorEstado?.Resuelto || 0) +
                (indicadores?.volumenPorEstado?.Cerrado || 0)}
            </p>
          </div>
        </div>

        {/* Filtros Reproducibles */}
        <section style={styles.section}>
          <div style={styles.filterHeader}>
            <h3 style={{ margin: 0 }}>📊 Distribución Agregada por Estado y Prioridad</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
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
            </div>
          </div>

          {/* Desglose en Tablas de Volumen */}
          <div style={styles.twoColumnGrid}>
            {/* Tabla por Categoria */}
            <div style={styles.subCard}>
              <h4 style={styles.subCardTitle}>Volumen por Categoría</h4>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Categoría</th>
                    <th style={styles.th}>Cantidad</th>
                    <th style={styles.th}>Proporción</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(indicadores?.volumenPorCategoria || {}).map(([cat, cant]) => {
                    if (filtroCategoria !== 'Todas' && filtroCategoria !== cat) return null;
                    const porcentaje = indicadores?.totalSolicitudes
                      ? ((cant / indicadores.totalSolicitudes) * 100).toFixed(1)
                      : 0;
                    return (
                      <tr key={cat}>
                        <td style={styles.td}><strong>{cat}</strong></td>
                        <td style={styles.td}>{cant}</td>
                        <td style={styles.td}>{porcentaje}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tabla por Prioridad */}
            <div style={styles.subCard}>
              <h4 style={styles.subCardTitle}>Volumen por Nivel de Prioridad</h4>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Prioridad</th>
                    <th style={styles.th}>Cantidad</th>
                    <th style={styles.th}>Proporción</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(indicadores?.volumenPorPrioridad || {}).map(([prio, cant]) => {
                    if (filtroPrioridad !== 'Todas' && filtroPrioridad !== prio) return null;
                    const porcentaje = indicadores?.totalSolicitudes
                      ? ((cant / indicadores.totalSolicitudes) * 100).toFixed(1)
                      : 0;
                    return (
                      <tr key={prio}>
                        <td style={styles.td}><strong>{prio}</strong></td>
                        <td style={styles.td}>{cant}</td>
                        <td style={styles.td}>{porcentaje}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

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
  content: { maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' },
  centerContainer: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b' },
  errorText: { color: '#ef4444', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' },
  highlightBanner: { backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
  medianValueBox: { textAlign: 'right', backgroundColor: '#ffffff', padding: '0.75rem 1.25rem', borderRadius: '8px', border: '1px solid #93c5fd' },
  medianNumber: { fontSize: '2rem', fontWeight: 'bold', color: '#1d4ed8', display: 'block', lineHeight: '1' },
  medianUnit: { fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  card: { backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardTitle: { margin: 0, fontSize: '0.85rem', color: '#64748b' },
  cardValue: { margin: '0.5rem 0 0', fontSize: '1.6rem', fontWeight: 'bold', color: '#0f172a' },
  section: { backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  filterHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' },
  selectFilter: { padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: '#ffffff', cursor: 'pointer' },
  twoColumnGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  subCard: { border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem' },
  subCardTitle: { margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#334155' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem' },
  td: { padding: '0.5rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem', color: '#334155' }
};