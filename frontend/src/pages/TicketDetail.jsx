import { useParams, Link } from 'react-router-dom';

export default function TicketDetail() {
  const { id } = useParams();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>Gestión del Ticket #{id || '---'}</h2>
        <Link to="/dashboard" style={styles.link}>← Volver al Dashboard</Link>
      </header>
      <div style={styles.card}>
        <p><strong>Estado:</strong> En proceso de implementación</p>
        <p>Aquí se mostrará el historial, comentarios y cambio de estados de la solicitud.</p>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  card: { padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#ffffff' },
  link: { color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }
};