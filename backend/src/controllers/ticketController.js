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

// Obtener solicitudes (Soporte para HU03 / HU04 / HU05 / HU06 / HU07 / HU08)
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
      .populate('comentarios.autor', 'nombre email rol') // HU06: Autor del comentario
      .populate('historialEstado.modificadoPor', 'nombre email') // HU07/HU08: Trazabilidad del cambio de estado y reapertura
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
      ticket.historialEstado.push({
        estadoAnterior: 'Nuevo',
        estadoNuevo: 'En Proceso',
        modificadoPor: req.user.id,
        motivo: 'Cambio automático al asignar agente',
        fecha: new Date()
      });
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

// HU06: Registrar comentarios de trabajo para documentar avances
const agregarComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const { texto } = req.body;

    // Criterio HU06: Comentario no vacío
    if (!texto || texto.trim() === '') {
      return res.status(400).json({
        mensaje: 'El comentario no puede estar vacío.'
      });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada.' });
    }

    // Criterio HU06: Autor y fecha inmutables, registrado como arreglo append-only
    const nuevoComentario = {
      texto: texto.trim(),
      autor: req.user.id,
      fecha: new Date()
    };

    ticket.comentarios.push(nuevoComentario);
    await ticket.save();

    res.status(201).json({
      mensaje: 'Comentario de trabajo registrado con éxito.',
      ticket
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al agregar el comentario',
      error: error.message
    });
  }
};

// HU07: Actualizar el estado de una solicitud con validación de transiciones e historial
const actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado: nuevoEstado } = req.body;

    if (!nuevoEstado) {
      return res.status(400).json({ mensaje: 'El nuevo estado es obligatorio.' });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada.' });
    }

    const estadoActual = ticket.estado;

    // Matriz de transiciones permitidas según el flujo (HU07)
    const transicionesPermitidas = {
      'Nuevo': ['En Proceso'],
      'En Proceso': ['Resuelto'],
      'Resuelto': ['Cerrado', 'En Proceso'],
      'Cerrado': []
    };

    if (!transicionesPermitidas[estadoActual] || !transicionesPermitidas[estadoActual].includes(nuevoEstado)) {
      return res.status(400).json({
        mensaje: `Transición inválida: No se permite cambiar de "${estadoActual}" a "${nuevoEstado}".`
      });
    }

    // Registrar trazabilidad inmutable del cambio de estado
    const registroEstado = {
      estadoAnterior: estadoActual,
      estadoNuevo: nuevoEstado,
      modificadoPor: req.user.id,
      fecha: new Date()
    };

    ticket.historialEstado.push(registroEstado);
    ticket.estado = nuevoEstado;

    await ticket.save();

    res.json({
      mensaje: 'Estado actualizado con éxito.',
      ticket
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al actualizar el estado de la solicitud',
      error: error.message
    });
  }
};

// HU08: Confirmar o Reabrir solución (Solo para el Solicitante autor de la solicitud)
const responderResolucion = async (req, res) => {
  try {
    const { id } = req.params;
    const { accion, motivo } = req.body; // accion: 'confirmar' | 'reabrir'

    if (!['confirmar', 'reabrir'].includes(accion)) {
      return res.status(400).json({ mensaje: 'Acción inválida. Debe ser "confirmar" o "reabrir".' });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada.' });
    }

    // Verificar que el usuario sea el solicitante dueño del ticket
    if (ticket.solicitante.toString() !== req.user.id) {
      return res.status(403).json({ mensaje: 'Solo el solicitante creador del ticket puede confirmar o reabrir la solución.' });
    }

    // Debe estar en estado Resuelto para poder responder
    if (ticket.estado !== 'Resuelto') {
      return res.status(400).json({ mensaje: 'Solo se pueden responder solicitudes en estado "Resuelto".' });
    }

    let nuevoEstado = '';
    let registroMotivo = '';

    if (accion === 'confirmar') {
      nuevoEstado = 'Cerrado';
      registroMotivo = 'Solución aceptada y confirmada por el solicitante.';
    } else if (accion === 'reabrir') {
      if (!motivo || motivo.trim() === '') {
        return res.status(400).json({ mensaje: 'Es obligatorio proporcionar un motivo para reabrir la solicitud.' });
      }
      nuevoEstado = 'En Proceso';
      registroMotivo = `Reabierto por el solicitante. Motivo: ${motivo.trim()}`;
    }

    ticket.historialEstado.push({
      estadoAnterior: 'Resuelto',
      estadoNuevo: nuevoEstado,
      modificadoPor: req.user.id,
      motivo: registroMotivo,
      fecha: new Date()
    });

    ticket.estado = nuevoEstado;
    await ticket.save();

    res.json({
      mensaje: accion === 'confirmar' ? 'Solución confirmada exitosamente.' : 'Solicitud reabierta exitosamente.',
      ticket
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al procesar la respuesta a la solución',
      error: error.message
    });
  }
};

module.exports = {
  crearTicket,
  obtenerTickets,
  actualizarPrioridad,
  asignarTicket,
  agregarComentario,
  actualizarEstado,
  responderResolucion
};