import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  agregarComentarioService,
  actualizarEstadoService,
  responderResolucionService
} from '../../services/ticketService';

export default function TicketDetailModal({ ticket, onClose, onCommentAdded, onStatusChanged }) {
  const { user, token } = useAuth();
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [motivoReapertura, setMotivoReapertura] = useState('');
  const [mostrarCampoReabrir, setMostrarCampoReabrir] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [errorComentario, setErrorComentario] = useState('');
  const [errorEstado, setErrorEstado] = useState('');

  if (!ticket) return null;

  // HU08: Validar si el usuario es el solicitante creador y la solicitud está en estado Resuelto
  const solicitanteId = ticket.solicitante?._id || ticket.solicitante;
  const esPropietario = solicitanteId === user?.id;
  const esResuelto = ticket.estado === 'Resuelto';
  const esSolicitante = user?.rol === 'Solicitante';
  const puedeResponderResolucion = esSolicitante && esPropietario && esResuelto;

  // Matriz de transiciones permitidas según el flujo (HU07)
  const transicionesPermitidas = {
    'Nuevo': ['En Proceso'],
    'En Proceso': ['Resuelto'],
    'Resuelto': ['Cerrado', 'En Proceso'],
    'Cerrado': []
  };

  const estadosSiguientes = transicionesPermitidas[ticket.estado] || [];
  const puedeCambiarEstado = (user?.rol === 'Agente' || user?.rol === 'Coordinador') && estadosSiguientes.length > 0;
  const puedeComentar = user?.rol === 'Agente' || user?.rol === 'Coordinador';

  const handleGuardarComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) {
      setErrorComentario('El comentario no puede estar vacío.');
      return;
    }

    try {
      setGuardando(true);
      setErrorComentario('');
      await agregarComentarioService(ticket._id, nuevoComentario, token);
      setNuevoComentario('');
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      setErrorComentario(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado) => {
    if (!nuevoEstado) return;
    try {
      setProcesando(true);
      setErrorEstado('');
      await actualizarEstadoService(ticket._id, nuevoEstado, token);
      if (onStatusChanged) onStatusChanged();
    } catch (err) {
      setErrorEstado(err.message);
    } finally {
      setProcesando(false);
    }
  };

  // HU08: Confirmar Solución (Solicitante)
  const handleConfirmarSolucion = async () => {
    try {
      setProcesando(true);
      setErrorEstado('');
      await responderResolucionService(ticket._id, 'confirmar', '', token);
      if (onStatusChanged) onStatusChanged();
    } catch (err) {
      setErrorEstado(err.message);
    } finally {
      setProcesando(false);
    }
  };

  // HU08: Reabrir Solicitud con Motivo Obligatorio (Solicitante)
  const handleReabrirSolicitud = async (e) => {
    e.preventDefault();
    if (!motivoReapertura.trim()) {
      setErrorEstado('Debe ingresar un motivo obligatorio para reabrir la solicitud.');
      return;
    }
    try {
      setProcesando(true);
      setErrorEstado('');
      await responderResolucionService(ticket._id, 'reabrir', motivoReapertura, token);
      setMotivoReapertura('');
      setMostrarCampoReabrir(false);
      if (onStatusChanged) onStatusChanged();
    } catch (err) {
      setErrorEstado(err.message);
    } finally {
      setProcesando(false);
    }
  };

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

        {/* HU07: Cambio de Estado por Agente/Coordinador */}
        <div style={detailGroup}>
          <strong>Estado:</strong>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={statusBadgeStyle(ticket.estado)}>{ticket.estado}</span>
            {puedeCambiarEstado && (
              <select
                disabled={procesando}
                onChange={(e) => handleCambiarEstado(e.target.value)}
                defaultValue=""
                style={selectStatusStyle}
              >
                <option value="" disabled>Cambiar estado...</option>
                {estadosSiguientes.map((st) => (
                  <option key={st} value={st}>
                    Pasar a: {st}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        {errorEstado && <p style={{ color: '#ef4444', fontSize: '0.8rem', textAlign: 'right', margin: '2px 0 8px' }}>{errorEstado}</p>}

        {/* HU08: Panel de Respuesta a la Solución (Solo para el Solicitante cuando la solicitud está Resuelta) */}
        {puedeResponderResolucion && (
          <div style={confirmBoxStyle}>
            <strong style={{ display: 'block', color: '#166534', marginBottom: '6px' }}>
              El agente ha marcado esta solicitud como "Resuelta". ¿Deseas confirmar la solución o reabrirla?
            </strong>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                disabled={procesando}
                onClick={handleConfirmarSolucion}
                style={confirmBtnStyle}
              >
                {procesando ? 'Procesando...' : '✓ Confirmar Solución'}
              </button>
              <button
                disabled={procesando}
                onClick={() => setMostrarCampoReabrir(!mostrarCampoReabrir)}
                style={reopenBtnStyle}
              >
                ↩ Reabrir Solicitud
              </button>
            </div>

            {mostrarCampoReabrir && (
              <form onSubmit={handleReabrirSolicitud} style={{ marginTop: '10px' }}>
                <textarea
                  placeholder="Describe el motivo obligatorio por el cual reabres la solicitud..."
                  value={motivoReapertura}
                  onChange={(e) => setMotivoReapertura(e.target.value)}
                  style={textareaStyle}
                  rows={2}
                />
                <button type="submit" disabled={procesando} style={submitReopenBtnStyle}>
                  Confirmar Reapertura
                </button>
              </form>
            )}
          </div>
        )}

        <div style={detailGroup}>
          <strong>Solicitante:</strong> <span>{ticket.solicitante?.nombre} ({ticket.solicitante?.email})</span>
        </div>
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

        {/* HU06: Sección de Comentarios de Trabajo */}
        <div style={{ marginTop: '20px' }}>
          <strong>Comentarios de Trabajo:</strong>

          {ticket.comentarios && ticket.comentarios.length > 0 ? (
            <div style={commentsContainerStyle}>
              {ticket.comentarios.map((c, index) => (
                <div key={index} style={commentBoxStyle}>
                  <div style={commentHeaderStyle}>
                    <strong>{c.autor?.nombre || 'Usuario'} ({c.autor?.rol || 'Rol'})</strong>
                    <span>{new Date(c.fecha).toLocaleString()}</span>
                  </div>
                  <p style={{ margin: '5px 0 0', color: '#334155' }}>{c.texto}</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', margin: '5px 0' }}>
              No hay comentarios de trabajo registrados.
            </p>
          )}

          {/* Formulario para agregar comentarios (Agentes y Coordinadores) */}
          {puedeComentar && (
            <form onSubmit={handleGuardarComentario} style={{ marginTop: '12px' }}>
              <textarea
                placeholder="Escribe un comentario de avance..."
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                style={textareaStyle}
                rows={3}
              />
              {errorComentario && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '4px 0' }}>{errorComentario}</p>}
              <button
                type="submit"
                disabled={guardando}
                style={addCommentBtnStyle}
              >
                {guardando ? 'Guardando...' : 'Agregar Comentario'}
              </button>
            </form>
          )}
        </div>

        {/* HU07/HU08: Trazabilidad del Historial de Estados y Motivos */}
        {ticket.historialEstado && ticket.historialEstado.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <strong>Historial de Cambios de Estado:</strong>
            <ul style={historyListStyle}>
              {ticket.historialEstado.map((hist, index) => (
                <li key={index} style={{ marginBottom: '6px' }}>
                  Cambió de <strong>{hist.estadoAnterior}</strong> a <strong>{hist.estadoNuevo}</strong> por{' '}
                  {hist.modificadoPor?.nombre || 'Usuario'} ({new Date(hist.fecha).toLocaleString()})
                  {hist.motivo && (
                    <span style={{ display: 'block', fontStyle: 'italic', color: '#475569', fontSize: '0.8rem', marginTop: '2px' }}>
                      💬 {hist.motivo}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

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

        {/* Sección de Trazabilidad Asignación HU05 */}
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
  width: '100%', maxWidth: '600px', color: '#333', maxHeight: '90vh', overflowY: 'auto'
};

const closeBtnStyle = {
  background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b'
};

const detailGroup = {
  marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
};

const selectStatusStyle = {
  padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem', cursor: 'pointer'
};

const descriptionStyle = {
  backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px',
  border: '1px solid #e2e8f0', marginTop: '5px'
};

const commentsContainerStyle = {
  maxHeight: '180px', overflowY: 'auto', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px'
};

const commentBoxStyle = {
  backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem'
};

const commentHeaderStyle = {
  display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem'
};

const textareaStyle = {
  width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1',
  fontSize: '0.85rem', fontFamily: 'inherit', boxSizing: 'border-box'
};

const addCommentBtnStyle = {
  marginTop: '6px', backgroundColor: '#2563eb', color: '#fff', border: 'none',
  padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold'
};

const historyListStyle = {
  fontSize: '0.85rem', color: '#475569', marginTop: '5px',
  backgroundColor: '#f8fafc', padding: '10px 10px 10px 25px', borderRadius: '6px', border: '1px solid #e2e8f0'
};

const cancelBtnStyle = {
  padding: '8px 16px', backgroundColor: '#64748b', color: '#fff',
  border: 'none', borderRadius: '4px', cursor: 'pointer'
};

const confirmBoxStyle = {
  backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '6px', margin: '12px 0'
};

const confirmBtnStyle = {
  backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold'
};

const reopenBtnStyle = {
  backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold'
};

const submitReopenBtnStyle = {
  marginTop: '6px', backgroundColor: '#991b1b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold'
};

const statusBadgeStyle = (estado) => ({
  backgroundColor:
    estado === 'Nuevo'
      ? '#3b82f6'
      : estado === 'En Proceso'
      ? '#f59e0b'
      : estado === 'Resuelto'
      ? '#10b981'
      : '#64748b',
  color: '#fff',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.8rem',
  fontWeight: 'bold'
});

const priorityBadgeStyle = (prioridad) => ({
  backgroundColor:
    prioridad === 'Crítica'
      ? '#dc2626'
      : prioridad === 'Alta'
      ? '#ea580c'
      : prioridad === 'Media'
      ? '#d97706'
      : '#16a34a',
  color: '#fff',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.8rem',
  fontWeight: 'bold'
});