const express = require('express');
const router = express.Router();
const { crearTicket, obtenerTickets, actualizarPrioridad } = require('../controllers/ticketController');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/authRole');

// Rutas protegidas por JWT
router.post('/', verifyToken, crearTicket);
router.get('/', verifyToken, obtenerTickets);

// HU04: Actualizar la prioridad de un ticket (restringido a Coordinador)
router.patch('/:id/prioridad', verifyToken, checkRole(['Coordinador']), actualizarPrioridad);

module.exports = router;    