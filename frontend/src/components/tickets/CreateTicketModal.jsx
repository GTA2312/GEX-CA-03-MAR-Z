import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { crearTicketService } from '../../services/ticketService';

export default function CreateTicketModal({ isOpen, onClose, onTicketCreated }) {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    prioridad: 'Media',
    justificacion: '',
    fechaObjetivo: ''
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

  const esPrioridadAltaOCritica = ['Alta', 'Crítica'].includes(formData.prioridad);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.titulo.trim() || !formData.descripcion.trim() || !formData.categoria) {
      setError('El título, la descripción y la categoría son campos obligatorios.');
      return;
    }

    if (esPrioridadAltaOCritica) {
      if (!formData.justificacion.trim() || !formData.fechaObjetivo) {
        setError('Las solicitudes de prioridad Alta o Crítica requieren una justificación y una fecha objetivo.');
        return;
      }
    }

    try {
      setCargando(true);

      const payload = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        categoria: formData.categoria,
        prioridad: formData.prioridad,
        justificacion: esPrioridadAltaOCritica ? formData.justificacion.trim() : undefined,
        fechaObjetivo: esPrioridadAltaOCritica ? formData.fechaObjetivo : undefined
      };

      await crearTicketService(payload, token);
      
      setFormData({
        titulo: '',
        descripcion: '',
        categoria: '',
        prioridad: 'Media',
        justificacion: '',
        fechaObjetivo: ''
      });
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
        {/* Cabecera idéntica al modal de Detalle */}
        <div style={headerContainerStyle}>
          <h2 style={modalTitleStyle}>Nueva Solicitud de Soporte</h2>
          <button style={closeButtonStyle} onClick={onClose} type="button" title="Cerrar">
            ✕
          </button>
        </div>

        <hr style={dividerStyle} />

        {error && (
          <div style={errorAlertStyle}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Título *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ej: Falla de conexión a la red"
              style={inputStyle}
              required
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Categoría *</label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              style={inputStyle}
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
            <label style={labelStyle}>Prioridad</label>
            <select
              name="prioridad"
              value={formData.prioridad}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>

          {/* Campos condicionales para Sprint 2 */}
          {esPrioridadAltaOCritica && (
            <>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Justificación de Prioridad *</label>
                <textarea
                  name="justificacion"
                  rows="2"
                  value={formData.justificacion}
                  onChange={handleChange}
                  placeholder="Indique el motivo de la prioridad alta o crítica..."
                  style={textareaStyle}
                  required
                ></textarea>
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Fecha Objetivo de Resolución *</label>
                <input
                  type="date"
                  name="fechaObjetivo"
                  value={formData.fechaObjetivo}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>
            </>
          )}

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Descripción *</label>
            <textarea
              name="descripcion"
              rows="3"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe detalladamente el problema..."
              style={textareaStyle}
              required
            ></textarea>
          </div>

          {/* Botones estilizados en la parte inferior */}
          <div style={actionsContainerStyle}>
            <button type="button" onClick={onClose} disabled={cargando} style={secondaryButtonStyle}>
              Cancelar
            </button>
            <button type="submit" disabled={cargando} style={primaryButtonStyle}>
              {cargando ? 'Guardando...' : 'Crear Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== ESTILOS visuales unificados ====================

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(2px)'
};

const modalContentStyle = {
  background: '#ffffff',
  padding: '24px 28px',
  borderRadius: '12px',
  width: '100%',
  maxWidth: '520px',
  color: '#1f2937',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  maxHeight: '90vh',
  overflowY: 'auto',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

const headerContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const modalTitleStyle = {
  margin: 0,
  fontSize: '1.35rem',
  fontWeight: '700',
  color: '#1e293b'
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1.25rem',
  cursor: 'pointer',
  color: '#94a3b8',
  padding: '4px 8px',
  borderRadius: '4px',
  transition: 'color 0.2s'
};

const dividerStyle = {
  border: 'none',
  borderBottom: '1px solid #e2e8f0',
  margin: '16px 0 12px 0'
};

const errorAlertStyle = {
  backgroundColor: '#fef2f2',
  color: '#dc2626',
  padding: '10px 14px',
  borderRadius: '6px',
  border: '1px solid #fecaca',
  fontSize: '0.875rem',
  marginBottom: '12px'
};

const inputGroupStyle = {
  marginBottom: '14px',
  display: 'flex',
  flexDirection: 'column'
};

const labelStyle = {
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#334155',
  marginBottom: '4px'
};

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#1e293b',
  backgroundColor: '#ffffff'
};

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical',
  fontFamily: 'inherit'
};

const actionsContainerStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '20px',
  paddingTop: '12px',
  borderTop: '1px solid #f1f5f9'
};

const primaryButtonStyle = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  border: 'none',
  padding: '8px 18px',
  borderRadius: '6px',
  fontSize: '0.9rem',
  fontWeight: '600',
  cursor: 'pointer'
};

const secondaryButtonStyle = {
  backgroundColor: '#5b6b82',
  color: '#ffffff',
  border: 'none',
  padding: '8px 18px',
  borderRadius: '6px',
  fontSize: '0.9rem',
  fontWeight: '500',
  cursor: 'pointer'
};