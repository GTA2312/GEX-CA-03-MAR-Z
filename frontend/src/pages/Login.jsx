import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginRequest(formData);
      login(data);
      navigate('/dashboard'); // Redirige al panel principal tras loguearse
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Plataforma MAR-Z</h2>
        <p style={styles.subtitle}>Gestión Colaborativa de Solicitudes</p>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input
              type="email"
              name="email"
              required
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Iniciando sesión...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Estilos integrados rápidos
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6'
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '2rem',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  title: {
    margin: 0,
    fontSize: '1.75rem',
    color: '#111827',
    textAlign: 'center'
  },
  subtitle: {
    margin: '0.5rem 0 1.5rem',
    fontSize: '0.9rem',
    color: '#6b7280',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#374151'
  },
  input: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    outline: 'none'
  },
  button: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  errorAlert: {
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: '6px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    fontSize: '0.85rem',
    textAlign: 'center'
  }
};