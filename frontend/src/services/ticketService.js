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