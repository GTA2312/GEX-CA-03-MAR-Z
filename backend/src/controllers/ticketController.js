const Ticket = require('../models/Ticket');
const User = require('../models/User');

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

// Obtener solicitudes (Soporte para HU03 / HU04 / HU05)
const obtenerTickets = async (req, res) => {
  try {
    let filtro = {};

    // Si es Solicitante, solo ve sus propias solicitudes
    if (req.user.rol === 'Solicitante') {
      filtro = { solicitante: req.user.id };
    }

    const tickets = await Ticket.find(filtro)
      .populate('solicitante', 'nombre email')
      .populate('agenteAsignado', 'nombre email estado')
      .populate('historialPrioridad.modificadoPor', 'nombre email') // Trazabilidad HU04
      .populate('historialAsignacion.asignadoPor', 'nombre email') // Trazabilidad HU05
      .populate('historialAsignacion.agenteNuevo', 'nombre email')
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

// HU05: Asignar una solicitud a un agente activo (Solo Coordinador)
const asignarTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { agenteId } = req.body;

    if (!agenteId) {
      return res.status(400).json({ mensaje: 'El ID del agente es obligatorio.' });
    }

    // 1. Validar existencia, rol y estado del agente
    const agente = await User.findById(agenteId);
    if (!agente) {
      return res.status(404).json({ mensaje: 'El usuario especificado no existe.' });
    }

    if (agente.rol !== 'Agente') {
      return res.status(400).json({ mensaje: 'Asignación inválida: El usuario seleccionado no es un Agente.' });
    }

    if (agente.estado !== 'Activo') {
      return res.status(400).json({ mensaje: 'Asignación inválida: El agente seleccionado no está Activo en el sistema.' });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada.' });
    }

    // 2. Registrar trazabilidad inmutable de quién y cuándo asignó
    const registroAsignacion = {
      agenteAnterior: ticket.agenteAsignado,
      agenteNuevo: agente._id,
      asignadoPor: req.user.id,
      fecha: new Date()
    };

    ticket.historialAsignacion.push(registroAsignacion);
    ticket.agenteAsignado = agente._id;

    // Cambiar estado automáticamente a "En Proceso" si la solicitud estaba en estado "Nuevo"
    if (ticket.estado === 'Nuevo') {
      ticket.estado = 'En Proceso';
    }

    await ticket.save();

    // 3. Notificar al agente dentro de la aplicación
    agente.notificaciones.push({
      mensaje: `Se te ha asignado la solicitud: "${ticket.titulo}"`,
      ticketId: ticket._id,
      fecha: new Date()
    });
    await agente.save();

    res.json({
      mensaje: 'Solicitud asignada exitosamente y notificación registrada.',
      ticket
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al asignar la solicitud',
      error: error.message
    });
  }
};

module.exports = {
  crearTicket,
  obtenerTickets,
  actualizarPrioridad,
  asignarTicket
};