import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { exportarReporteCSVService } from '../../services/ticketService';

export default function ExportarCSVModal({ isOpen, onClose }) {
  const { token } = useAuth();

  const [filtros, setFiltros] = useState({
    estado: 'Todos',
    prioridad: 'Todas',
    categoria: 'Todas'
  });
  const [exportando, setExportando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value
    });
  };

  const handleExportar = async () => {
    setExportando(true);
    setMensajeError('');
    try {
      await exportarReporteCSVService(filtros, token);
      setExportando(false);
      onClose();
    } catch (err) {
      setMensajeError(err.message);
      setExportando(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>📊 Exportar Reporte Operativo (CSV)</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <p style={styles.description}>
          Aplica los filtros requeridos para generar la exportación de tickets sin incluir credenciales ni información sensible.
        </p>

        {mensajeError && <p style={styles.errorText}>{mensajeError}</p>}

        <div style={styles.formGroup}>
          <label style={styles.label}>Estado:</label>
          <select name="estado" value={filtros.estado} onChange={handleChange} style={styles.select}>
            <option value="Todos">Todos los Estados</option>
            <option value="Nuevo">Nuevo</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Resuelto">Resuelto</option>
            <option value="Cerrado">Cerrado</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Prioridad:</label>
          <select name="prioridad" value={filtros.prioridad} onChange={handleChange} style={styles.select}>
            <option value="Todas">Todas las Prioridades</option>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
            <option value="Crítica">Crítica</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Categoría:</label>
          <select name="categoria" value={filtros.categoria} onChange={handleChange} style={styles.select}>
            <option value="Todas">Todas las Categorías</option>
            <option value="Soporte Técnico">Soporte Técnico</option>
            <option value="Sistemas Operativos">Sistemas Operativos</option>
            <option value="Redes y Conectividad">Redes y Conectividad</option>
            <option value="Hardware y Equipos">Hardware y Equipos</option>
            <option value="Acceso y Permisos">Acceso y Permisos</option>
          </select>
        </div>

        <div style={styles.actions}>
          <button onClick={onClose} style={styles.cancelBtn} disabled={exportando}>
            Cancelar
          </button>
          <button onClick={handleExportar} style={styles.exportBtn} disabled={exportando}>
            {exportando ? 'Generando CSV...' : '📥 Descargar CSV'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.5rem', width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' },
  description: { fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' },
  formGroup: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.25rem' },
  select: { width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', backgroundColor: '#ffffff' },
  errorText: { color: '#ef4444', fontSize: '0.85rem', backgroundColor: '#fef2f2', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' },
  cancelBtn: { padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', cursor: 'pointer', fontWeight: '500' },
  exportBtn: { padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', cursor: 'pointer', fontWeight: '600' }
};