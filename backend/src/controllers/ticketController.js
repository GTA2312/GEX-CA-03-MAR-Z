const Ticket = require('../models/Ticket');

// Crear un nuevo ticket
const crearTicket = async (req, res) => {
  try {
    const { titulo, descripcion, prioridad } = req.body;

    const nuevoTicket = new Ticket({
      titulo,
      descripcion,
      prioridad: prioridad || 'Media',
      solicitante: req.user.id
    });

    await nuevoTicket.save();
    res.status(201).json({ mensaje: 'Ticket creado con éxito', ticket: nuevoTicket });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el ticket', error: error.message });
  }
};

// Obtener tickets (Filtrado según rol)
const obtenerTickets = async (req, res) => {
  try {
    let filtro = {};

    // Si es Solicitante, solo ve sus propios tickets
    if (req.user.rol === 'Solicitante') {
      filtro = { solicitante: req.user.id };
    }

    const tickets = await Ticket.find(filtro)
      .populate('solicitante', 'nombre email')
      .populate('agenteAsignado', 'nombre email')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener tickets', error: error.message });
  }
};

module.exports = {
  crearTicket,
  obtenerTickets
};