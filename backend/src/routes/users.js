const express = require('express');
const router = express.Router();
const { obtenerAgentesActivos, obtenerNotificaciones } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/authRole');

// HU05: Obtener agentes activos (Solo el Coordinador puede listar agentes para asignar)
router.get('/agentes', verifyToken, checkRole(['Coordinador']), obtenerAgentesActivos);

// HU05: Obtener notificaciones en la aplicación para el usuario actual
router.get('/notificaciones', verifyToken, obtenerNotificaciones);

module.exports = router;