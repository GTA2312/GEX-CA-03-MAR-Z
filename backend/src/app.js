const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tickets', require('./routes/tickets')); // Asegúrate de que el archivo en backend/src/routes/ se llame tickets.js o ajusta el nombre

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API del Sistema de Soporte MAR-Z funcionando correctamente.');
});

module.exports = app;