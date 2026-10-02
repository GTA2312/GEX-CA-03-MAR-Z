const API_URL = 'http://localhost:5000/api/users';

// HU05: Obtener agentes activos para asignación por parte del Coordinador
export const obtenerAgentesActivosService = async (token) => {
  const response = await fetch(`${API_URL}/agentes`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al obtener la lista de agentes.');
  }

  return data;
};

// HU05: Obtener notificaciones registradas en la aplicación para el usuario actual
export const obtenerNotificacionesService = async (token) => {
  const response = await fetch(`${API_URL}/notificaciones`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al obtener las notificaciones.');
  }

  return data;
};