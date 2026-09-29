const Ticket = require('../models/Ticket');

// HU02: Crear una nueva solicitud de soporte
const crearTicket = async (req, res) => {
  try {
    const { titulo, descripcion, categoria, prioridad } = req.body;

    // Validar campos obligatorios según criterios de HU02
    if (!titulo || !descripcion || !categoria) {
      return res.status(400).json({
        mensaje: 'El título, la descripción y la categoría son campos obligatorios.'
      });
    }

    const nuevoTicket = new Ticket({
      titulo,
      descripcion,
      categoria,
      prioridad: prioridad || 'Media',
      estado: 'Nuevo', // Estado por defecto según requerimiento HU02
      solicitante: req.user.id // Propietario asignado desde el token JWT
    });

    await nuevoTicket.save();

    res.status(201).json({
      mensaje: 'Solicitud creada con éxito.',
      ticket: nuevoTicket
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al crear la solicitud',
      error: error.message
    });
  }
};

// Obtener solicitudes (Soporte para HU03 / HU04)
const obtenerTickets = async (req, res) => {
  try {
    let filtro = {};

    // Si es Solicitante, solo ve sus propias solicitudes
    if (req.user.rol === 'Solicitante') {
      filtro = { solicitante: req.user.id };
    }

    const tickets = await Ticket.find(filtro)
      .populate('solicitante', 'nombre email')
      .populate('agenteAsignado', 'nombre email')
      .populate('historialPrioridad.modificadoPor', 'nombre email') // Trazabilidad HU04
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener solicitudes',
      error: error.message
    });
  }
};

// HU04: Actualizar la prioridad de una solicitud (Solo Coordinador)
const actualizarPrioridad = async (req, res) => {
  try {
    const { id } = req.params;
    const { prioridad } = req.body;

    const prioridadesValidas = ['Baja', 'Media', 'Alta', 'Crítica'];
    if (!prioridadesValidas.includes(prioridad)) {
      return res.status(400).json({
        mensaje: 'Prioridad no válida. Opciones permitidas: Baja, Media, Alta, Crítica.'
      });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada.' });
    }

    // Registrar trazabilidad del cambio de prioridad
    const cambioTrazable = {
      prioridadAnterior: ticket.prioridad,
      prioridadNueva: prioridad,
      modificadoPor: req.user.id,
      fecha: new Date()
    };

    ticket.historialPrioridad.push(cambioTrazable);
    ticket.prioridad = prioridad;

    await ticket.save();

    res.json({
      mensaje: 'Prioridad actualizada con éxito.',
      ticket
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar la prioridad',
      error: error.message
    });
  }
};

module.exports = {
  crearTicket,
  obtenerTickets,
  actualizarPrioridad
};