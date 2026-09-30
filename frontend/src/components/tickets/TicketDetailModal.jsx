export default function TicketDetailModal({ ticket, onClose }) {
  if (!ticket) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Detalle de Solicitud</h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>
        <hr style={{ margin: '15px 0', borderColor: '#e2e8f0' }} />

        <div style={detailGroup}>
          <strong>ID del Ticket:</strong> <span>{ticket._id}</span>
        </div>
        <div style={detailGroup}>
          <strong>Título:</strong> <span>{ticket.titulo}</span>
        </div>
        <div style={detailGroup}>
          <strong>Categoría:</strong> <span>{ticket.categoria}</span>
        </div>
        <div style={detailGroup}>
          <strong>Prioridad:</strong> <span style={priorityBadgeStyle(ticket.prioridad)}>{ticket.prioridad}</span>
        </div>
        <div style={detailGroup}>
          <strong>Estado:</strong> <span style={statusBadgeStyle(ticket.estado)}>{ticket.estado}</span>
        </div>
        <div style={detailGroup}>
          <strong>Solicitante:</strong> <span>{ticket.solicitante?.nombre} ({ticket.solicitante?.email})</span>
        </div>
        {/* HU05: Visualización de Agente Asignado */}
        <div style={detailGroup}>
          <strong>Agente Asignado:</strong>{' '}
          <span>{ticket.agenteAsignado?.nombre || <em style={{ color: '#94a3b8' }}>Sin asignar</em>}</span>
        </div>
        <div style={detailGroup}>
          <strong>Fecha de Creación:</strong> <span>{new Date(ticket.createdAt).toLocaleString()}</span>
        </div>
        <div style={detailGroup}>
          <strong>Última Actualización:</strong> <span>{new Date(ticket.updatedAt).toLocaleString()}</span>
        </div>

        <div style={{ marginTop: '15px' }}>
          <strong>Descripción:</strong>
          <p style={descriptionStyle}>{ticket.descripcion}</p>
        </div>

        {/* Sección de Trazabilidad Prioridad HU04 */}
        {ticket.historialPrioridad && ticket.historialPrioridad.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <strong>Historial de Cambios de Prioridad:</strong>
            <ul style={historyListStyle}>
              {ticket.historialPrioridad.map((cambio, index) => (
                <li key={index} style={{ marginBottom: '4px' }}>
                  Cambió de <strong>{cambio.prioridadAnterior}</strong> a <strong>{cambio.prioridadNueva}</strong> por{' '}
                  {cambio.modificadoPor?.nombre || 'Coordinador'} ({new Date(cambio.fecha).toLocaleString()})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* HU05: Sección de Trazabilidad de Asignación */}
        {ticket.historialAsignacion && ticket.historialAsignacion.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <strong>Historial de Asignaciones:</strong>
            <ul style={historyListStyle}>
              {ticket.historialAsignacion.map((registro, index) => (
                <li key={index} style={{ marginBottom: '4px' }}>
                  Asignado a <strong>{registro.agenteNuevo?.nombre || 'Agente'}</strong> por{' '}
                  {registro.asignadoPor?.nombre || 'Coordinador'} ({new Date(registro.fecha).toLocaleString()})
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ textAlign: 'right', marginTop: '20px' }}>
          <button onClick={onClose} style={cancelBtnStyle}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 1000
};

const modalStyle = {
  background: '#fff', padding: '25px', borderRadius: '8px',
  width: '100%', maxWidth: '550px', color: '#333', maxHeight: '90vh', overflowY: 'auto'
};

const closeBtnStyle = {
  background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b'
};

const detailGroup = {
  marginBottom: '8px', display: 'flex', justifyContent: 'space-between'
};

const descriptionStyle = {
  backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px',
  border: '1px solid #e2e8f0', marginTop: '5px'
};

const historyListStyle = {
  fontSize: '0.85rem',
  color: '#475569',
  marginTop: '5px',
  backgroundColor: '#f8fafc',
  padding: '10px 10px 10px 25px',
  borderRadius: '6px',
  border: '1px solid #e2e8f0'
};

const cancelBtnStyle = {
  padding: '8px 16px', backgroundColor: '#64748b', color: '#fff',
  border: 'none', borderRadius: '4px', cursor: 'pointer'
};

const statusBadgeStyle = (estado) => ({
  backgroundColor: estado === 'Nuevo' ? '#3b82f6' : estado === 'En Proceso' ? '#f59e0b' : '#10b981',
  color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
});

const priorityBadgeStyle = (prioridad) => ({
  backgroundColor: prioridad === 'Crítica' ? '#dc2626' : prioridad === 'Alta' ? '#ea580c' : prioridad === 'Media' ? '#d97706' : '#16a34a',
  color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
});