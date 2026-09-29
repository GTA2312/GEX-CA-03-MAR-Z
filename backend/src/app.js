const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json()); // Permite recibir datos en formato JSON

// Rutas base (Los archivos de rutas deben estar creados, aunque estén vacíos por ahora)
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/tickets', require('./routes/tickets'));

// Ruta de prueba para verificar que el servidor vive
app.get('/', (req, res) => {
  res.send('API del Sistema de Soporte MAR-Z funcionando correctamente.');
});

module.exports = app;