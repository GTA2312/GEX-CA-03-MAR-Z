const Ticket = require('../models/Ticket');
const User = require('../models/User');

// HU02: Crear una nueva solicitud de soporte
const crearTicket = async (req, res) => {
  try {
    const { titulo, descripcion, categoria, prioridad } = req.body;

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
      estado: 'Nuevo',
      solicitante: req.user.id
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

// Obtener solicitudes (Soporte HU03, HU04, HU05, HU06, HU07, HU08, HU09)
const obtenerTickets = async (req, res) => {
  try {
    let filtro = {};

    // Criterio HU09 / HU03: El solicitante solo recibe del backend sus propias solicitudes
    if (req.user.rol === 'Solicitante') {
      filtro = { solicitante: req.user.id };
    }

    const tickets = await Ticket.find(filtro)
      .populate('solicitante', 'nombre email')
      .populate('agenteAsignado', 'nombre email estado')
      .populate('historialPrioridad.modificadoPor', 'nombre email')
      .populate('historialAsignacion.asignadoPor', 'nombre email')
      .populate('historialAsignacion.agenteNuevo', 'nombre email')
      .populate('comentarios.autor', 'nombre email rol')
      .populate('historialEstado.modificadoPor', 'nombre email')
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

    const registroAsignacion = {
      agenteAnterior: ticket.agenteAsignado,
      agenteNuevo: agente._id,
      asignadoPor: req.user.id,
      fecha: new Date()
    };

    ticket.historialAsignacion.push(registroAsignacion);
    ticket.agenteAsignado = agente._id;

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

    if (!texto || texto.trim() === '') {
      return res.status(400).json({
        mensaje: 'El comentario no puede estar vacío.'
      });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada.' });
    }

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

// HU08: Confirmar o Reabrir solución (Solo Solicitante)
const responderResolucion = async (req, res) => {
  try {
    const { id } = req.params;
    const { accion, motivo } = req.body;

    if (!['confirmar', 'reabrir'].includes(accion)) {
      return res.status(400).json({ mensaje: 'Acción inválida. Debe ser "confirmar" o "reabrir".' });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ mensaje: 'Solicitud no encontrada.' });
    }

    if (ticket.solicitante.toString() !== req.user.id) {
      return res.status(403).json({ mensaje: 'Solo el solicitante creador del ticket puede confirmar o reabrir la solución.' });
    }

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

// HU10: Obtener indicadores agregados (Volumen por estado/categoría y tiempo mediano de ciclo sin ranking individual)
const obtenerIndicadores = async (req, res) => {
  try {
    const tickets = await Ticket.find();

    const volumenPorEstado = {
      Nuevo: tickets.filter((t) => t.estado === 'Nuevo').length,
      'En Proceso': tickets.filter((t) => t.estado === 'En Proceso').length,
      Resuelto: tickets.filter((t) => t.estado === 'Resuelto').length,
      Cerrado: tickets.filter((t) => t.estado === 'Cerrado').length
    };

    const volumenPorCategoria = {};
    tickets.forEach((t) => {
      volumenPorCategoria[t.categoria] = (volumenPorCategoria[t.categoria] || 0) + 1;
    });

    const volumenPorPrioridad = {};
    tickets.forEach((t) => {
      volumenPorPrioridad[t.prioridad] = (volumenPorPrioridad[t.prioridad] || 0) + 1;
    });

    // Cálculo de Tiempo Mediano de Ciclo (Horas transcurridas hasta solución/cierre)
    const tiemposCicloHoras = [];
    tickets.forEach((t) => {
      if (['Resuelto', 'Cerrado'].includes(t.estado)) {
        const eventoResolucion = t.historialEstado.find((h) => ['Resuelto', 'Cerrado'].includes(h.estadoNuevo));
        const fechaResolucion = eventoResolucion ? new Date(eventoResolucion.fecha) : new Date(t.updatedAt);
        const fechaCreacion = new Date(t.createdAt);
        const horas = Math.max(0, (fechaResolucion - fechaCreacion) / (1000 * 60 * 60));
        tiemposCicloHoras.push(horas);
      }
    });

    tiemposCicloHoras.sort((a, b) => a - b);
    let tiempoMedianoCicloHoras = 0;
    if (tiemposCicloHoras.length > 0) {
      const mitad = Math.floor(tiemposCicloHoras.length / 2);
      tiempoMedianoCicloHoras =
        tiemposCicloHoras.length % 2 !== 0
          ? tiemposCicloHoras[mitad]
          : (tiemposCicloHoras[mitad - 1] + tiemposCicloHoras[mitad]) / 2;
    }

    res.json({
      totalSolicitudes: tickets.length,
      volumenPorEstado,
      volumenPorCategoria,
      volumenPorPrioridad,
      tiempoMedianoCicloHoras: parseFloat(tiempoMedianoCicloHoras.toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al calcular indicadores agregados', error: error.message });
  }
};

// HU11: Consultar historial para auditoría (Modo lectura, actor codificado)
const obtenerHistorialAuditoria = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('solicitante', '_id nombre')
      .populate('agenteAsignado', '_id nombre')
      .populate('historialPrioridad.modificadoPor', '_id nombre')
      .populate('historialAsignacion.asignadoPor', '_id nombre')
      .populate('historialAsignacion.agenteNuevo', '_id nombre')
      .populate('historialEstado.modificadoPor', '_id nombre')
      .populate('comentarios.autor', '_id nombre');

    const codificarActor = (usuario) => {
      if (!usuario) return 'Sistema_Anonimo';
      const idStr = (usuario._id || usuario).toString();
      return `Actor_${idStr.slice(-6).toUpperCase()}`;
    };

    const eventosAuditoria = [];

    tickets.forEach((ticket) => {
      eventosAuditoria.push({
        ticketId: ticket._id,
        tituloTicket: ticket.titulo,
        fecha: ticket.createdAt,
        actorCodificado: codificarActor(ticket.solicitante),
        campo: 'Creación de Solicitud',
        valorAnterior: 'N/A',
        valorNuevo: `Estado: Nuevo | Prioridad: ${ticket.prioridad}`
      });

      ticket.historialPrioridad.forEach((hp) => {
        eventosAuditoria.push({
          ticketId: ticket._id,
          tituloTicket: ticket.titulo,
          fecha: hp.fecha,
          actorCodificado: codificarActor(hp.modificadoPor),
          campo: 'Prioridad',
          valorAnterior: hp.prioridadAnterior,
          valorNuevo: hp.prioridadNueva
        });
      });

      ticket.historialAsignacion.forEach((ha) => {
        eventosAuditoria.push({
          ticketId: ticket._id,
          tituloTicket: ticket.titulo,
          fecha: ha.fecha,
          actorCodificado: codificarActor(ha.asignadoPor),
          campo: 'Agente Asignado',
          valorAnterior: codificarActor(ha.agenteAnterior),
          valorNuevo: codificarActor(ha.agenteNuevo)
        });
      });

      ticket.historialEstado.forEach((he) => {
        eventosAuditoria.push({
          ticketId: ticket._id,
          tituloTicket: ticket.titulo,
          fecha: he.fecha,
          actorCodificado: codificarActor(he.modificadoPor),
          campo: 'Estado',
          valorAnterior: he.estadoAnterior,
          valorNuevo: `${he.estadoNuevo}${he.motivo ? ' (Motivo: ' + he.motivo + ')' : ''}`
        });
      });

      ticket.comentarios.forEach((c) => {
        eventosAuditoria.push({
          ticketId: ticket._id,
          tituloTicket: ticket.titulo,
          fecha: c.fecha,
          actorCodificado: codificarActor(c.autor),
          campo: 'Comentario de Trabajo',
          valorAnterior: 'N/A',
          valorNuevo: c.texto
        });
      });
    });

    eventosAuditoria.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    res.json(eventosAuditoria);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar historial de auditoría', error: error.message });
  }
};

// HU12: Exportar reporte CSV (Filtra, excluye credenciales y texto innecesario, registra exportación)
const exportarReporteCSV = async (req, res) => {
  try {
    const { estado, prioridad, categoria } = req.query;
    let filtro = {};

    if (estado && estado !== 'Todos') filtro.estado = estado;
    if (prioridad && prioridad !== 'Todas') filtro.prioridad = prioridad;
    if (categoria && categoria !== 'Todas') filtro.categoria = categoria;

    const tickets = await Ticket.find(filtro)
      .populate('agenteAsignado', 'nombre')
      .sort({ createdAt: -1 });

    let csv = 'ID Ticket,Titulo,Categoria,Prioridad,Estado,Agente Asignado,Fecha Creacion,Ultima Actualizacion\n';

    tickets.forEach((t) => {
      const tituloEscapado = `"${t.titulo.replace(/"/g, '""')}"`;
      const agente = t.agenteAsignado ? t.agenteAsignado.nombre : 'Sin Asignar';
      csv += `${t._id},${tituloEscapado},${t.categoria},${t.prioridad},${t.estado},"${agente}",${t.createdAt.toISOString()},${t.updatedAt.toISOString()}\n`;
    });

    console.log(`[AUDITORIA LOG] Exportación CSV generada por el usuario ID: ${req.user.id} a las ${new Date().toISOString()}`);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_solicitudes_marz.csv"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar la exportación CSV', error: error.message });
  }
};

module.exports = {
  crearTicket,
  obtenerTickets,
  actualizarPrioridad,
  asignarTicket,
  agregarComentario,
  actualizarEstado,
  responderResolucion,
  obtenerIndicadores,
  obtenerHistorialAuditoria,
  exportarReporteCSV
};