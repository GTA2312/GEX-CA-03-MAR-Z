import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

      {/* Métricas / Resumen rápido */}
      <main style={styles.content}>
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Pendientes</h3>
            <p style={styles.cardValue}>0</p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>En Atención</h3>
            <p style={styles.cardValue}>0</p>
          </div>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Resueltos</h3>
            <p style={styles.cardValue}>0</p>
          </div>
        </div>

        {/* Sección de Gestión de Solicitudes */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2>Gestión de Solicitudes</h2>
            {(user?.rol === 'Solicitante' || !user?.rol) && (
              <button style={styles.actionBtn}>+ Nueva Solicitud</button>
            )}
          </div>

          <div style={styles.tablePlaceholder}>
            <p>No se encontraron tickets registrados en el sistema.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

// Estilos limpios y organizados
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
  tablePlaceholder: {
    padding: '3rem',
    textAlign: 'center',
    color: '#94a3b8',
    border: '2px dashed #e2e8f0',
    borderRadius: '6px'
  }
};