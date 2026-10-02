require('dotenv').config(); // Carga las variables del .env
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Conectar a la base de datos y luego encender el servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[MAR-Z] Servidor corriendo en el puerto ${PORT}`);
  });
});