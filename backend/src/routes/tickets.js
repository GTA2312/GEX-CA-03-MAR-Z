const express = require('express');
const router = express.Router();
const {
  crearTicket,
  obtenerTickets,
  actualizarPrioridad,
  asignarTicket,
  agregarComentario,
  actualizarEstado,
  responderResolucion
} = require('../controllers/ticketController');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/authRole');

router.post('/', verifyToken, crearTicket);
router.get('/', verifyToken, obtenerTickets);
router.patch('/:id/prioridad', verifyToken, checkRole(['Coordinador']), actualizarPrioridad);

// HU05: Asignar ticket (Solo Coordinador)
router.patch('/:id/asignar', verifyToken, checkRole(['Coordinador']), asignarTicket);

// HU06: Agregar comentarios de trabajo (Agente y Coordinador)
router.post('/:id/comentarios', verifyToken, checkRole(['Agente', 'Coordinador']), agregarComentario);

// HU07: Cambiar estado de la solicitud (Agente y Coordinador)
router.patch('/:id/estado', verifyToken, checkRole(['Agente', 'Coordinador']), actualizarEstado);

// HU08: Confirmar o Reabrir solución (Solo Solicitante)
router.patch('/:id/conformidad', verifyToken, checkRole(['Solicitante']), responderResolucion);

module.exports = router;