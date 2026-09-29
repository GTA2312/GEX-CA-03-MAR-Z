import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { crearTicketService } from '../../services/ticketService';

export default function CreateTicketModal({ isOpen, onClose, onTicketCreated }) {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    prioridad: 'Media'
  });

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación mínima en el cliente
    if (!formData.titulo.trim() || !formData.descripcion.trim() || !formData.categoria) {
      setError('El título, la descripción y la categoría son obligatorios.');
      return;
    }

    try {
      setCargando(true);
      await crearTicketService(formData, token);
      
      // Limpiar formulario y notificar actualización
      setFormData({ titulo: '', descripcion: '', categoria: '', prioridad: 'Media' });
      onTicketCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>Nueva Solicitud de Soporte</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <label>Título *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ej: Falla de conexión a la red"
              required
            />
          </div>

          <div style={inputGroupStyle}>
            <label>Categoría *</label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
            >
              <option value="">-- Seleccionar Categoría --</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Redes">Redes</option>
              <option value="Acceso/Seguridad">Acceso/Seguridad</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div style={inputGroupStyle}>
            <label>Prioridad</label>
            <select
              name="prioridad"
              value={formData.prioridad}
              onChange={handleChange}
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>

          <div style={inputGroupStyle}>
            <label>Descripción *</label>
            <textarea
              name="descripcion"
              rows="4"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe detalladamente el problema..."
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button type="submit" disabled={cargando}>
              {cargando ? 'Guardando...' : 'Crear Solicitud'}
            </button>
            <button type="button" onClick={onClose} disabled={cargando}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Estilos rápidos en objeto para pruebas
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  background: '#fff',
  padding: '20px',
  borderRadius: '8px',
  width: '100%',
  maxWidth: '500px',
  color: '#333'
};

const inputGroupStyle = {
  marginBottom: '12px',
  display: 'flex',
  flexDirection: 'column'
};