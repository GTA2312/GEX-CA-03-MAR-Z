const express = require('express');
const router = express.Router();
const { crearTicket, obtenerTickets, actualizarPrioridad, asignarTicket } = require('../controllers/ticketController');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/authRole');

router.post('/', verifyToken, crearTicket);
router.get('/', verifyToken, obtenerTickets);
router.patch('/:id/prioridad', verifyToken, checkRole(['Coordinador']), actualizarPrioridad);

// HU05: Asignar ticket (Solo Coordinador)
router.patch('/:id/asignar', verifyToken, checkRole(['Coordinador']), asignarTicket);

module.exports = router;