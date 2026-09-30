const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio.'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria.']
    },
    rol: {
      type: String,
      enum: ['Solicitante', 'Coordinador', 'Agente', 'Auditor'],
      default: 'Solicitante'
    },
    // Campo requerido para HU05 (Agente activo)
    estado: {
      type: String,
      enum: ['Activo', 'Inactivo'],
      default: 'Activo'
    },
    // Notificaciones dentro de la aplicación (HU05)
    notificaciones: [
      {
        mensaje: String,
        ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
        leido: { type: Boolean, default: false },
        fecha: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);