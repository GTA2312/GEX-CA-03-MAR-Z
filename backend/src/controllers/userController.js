const User = require('../models/User');

// Obtener lista de agentes activos para asignación (HU05)
const obtenerAgentesActivos = async (req, res) => {
  try {
    const agentes = await User.find({ rol: 'Agente', estado: 'Activo' }).select('nombre email estado');
    res.json(agentes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener lista de agentes', error: error.message });
  }
};

// Obtener notificaciones del usuario autenticado (HU05)
const obtenerNotificaciones = async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id).select('notificaciones');
    res.json(usuario ? usuario.notificaciones : []);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener notificaciones', error: error.message });
  }
};

module.exports = {
  obtenerAgentesActivos,
  obtenerNotificaciones
};