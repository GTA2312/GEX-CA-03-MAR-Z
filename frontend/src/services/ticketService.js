const API_URL = 'http://localhost:5000/api/tickets';

// HU02: Crear una nueva solicitud
export const crearTicketService = async (ticketData, token) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(ticketData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al crear la solicitud.');
  }

  return data;
};

// HU03: Consultar las solicitudes
export const obtenerTicketsService = async (token) => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al obtener las solicitudes.');
  }

  return data;
};

// HU04: Actualizar la prioridad de un ticket (Solo Coordinador)
export const actualizarPrioridadService = async (ticketId, prioridad, token) => {
  const response = await fetch(`${API_URL}/${ticketId}/prioridad`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ prioridad })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al actualizar la prioridad del ticket.');
  }

  return data;
};

// HU05: Asignar una solicitud a un agente activo (Solo Coordinador)
export const asignarTicketService = async (ticketId, agenteId, token) => {
  const response = await fetch(`${API_URL}/${ticketId}/asignar`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ agenteId })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al asignar la solicitud.');
  }

  return data;
};

// HU06: Agregar comentarios de trabajo (Agente y Coordinador)
export const agregarComentarioService = async (ticketId, texto, token) => {
  const response = await fetch(`${API_URL}/${ticketId}/comentarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ texto })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al agregar el comentario.');
  }

  return data;
};

// HU07: Cambiar el estado de una solicitud (Agente y Coordinador)
export const actualizarEstadoService = async (ticketId, estado, token) => {
  const response = await fetch(`${API_URL}/${ticketId}/estado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ estado })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al actualizar el estado del ticket.');
  }

  return data;
};

// HU08: Confirmar o Reabrir solución (Solo Solicitante)
export const responderResolucionService = async (ticketId, accion, motivo, token) => {
  const response = await fetch(`${API_URL}/${ticketId}/conformidad`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ accion, motivo })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al procesar la conformidad.');
  }

  return data;
};

// HU10: Obtener Indicadores Agregados y Tiempo Mediano de Ciclo (Coordinador y Auditor)
export const obtenerIndicadoresService = async (token) => {
  const response = await fetch(`${API_URL}/indicadores`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al obtener los indicadores agregados.');
  }

  return data;
};

// HU11: Obtener Historial de Auditoría con Actor Codificado (Solo Auditor)
export const obtenerHistorialAuditoriaService = async (token) => {
  const response = await fetch(`${API_URL}/auditoria`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al obtener el historial de auditoría.');
  }

  return data;
};

// HU12: Servicio para solicitar y descargar el reporte CSV
export const exportarReporteCSVService = async (filtros, token) => {
  const queryParams = new URLSearchParams();
  
  if (filtros.estado && filtros.estado !== 'Todos') queryParams.append('estado', filtros.estado);
  if (filtros.prioridad && filtros.prioridad !== 'Todas') queryParams.append('prioridad', filtros.prioridad);
  if (filtros.categoria && filtros.categoria !== 'Todas') queryParams.append('categoria', filtros.categoria);

  // Se apunta directamente a API_URL
  const response = await fetch(`${API_URL}/exportar-csv?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.mensaje || 'Error al generar la exportación en CSV.');
  }

  // Descarga del archivo generado
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte_solicitudes_marz_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};