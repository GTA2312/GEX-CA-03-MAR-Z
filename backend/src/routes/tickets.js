const express = require('express');
const router = express.Router();
const { crearTicket, obtenerTickets } = require('../controllers/ticketController');
const { verifyToken } = require('../middlewares/authJwt');

// Rutas protegidas por JWT
router.post('/', verifyToken, crearTicket);
router.get('/', verifyToken, obtenerTickets);

module.exports = router;