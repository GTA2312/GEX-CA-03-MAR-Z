import { Link } from 'react-router-dom';

export default function Auditoria() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>Módulo de Auditoría</h2>
        <Link to="/dashboard" style={styles.link}>← Volver al Dashboard</Link>
      </header>
      <div style={styles.card}>
        <p><strong>Acceso Restringido:</strong> Rol Auditor</p>
        <p>Aquí se visualizará la bitácora de eventos, cambios de estado y trazabilidad del sistema.</p>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  card: { padding: '1.5rem', border: '1px dashed #ef4444', borderRadius: '8px', backgroundColor: '#fef2f2' },
  link: { color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }
};