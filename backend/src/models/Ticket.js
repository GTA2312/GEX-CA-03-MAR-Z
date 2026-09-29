const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true },
    prioridad: {
      type: String,
      enum: ['Baja', 'Media', 'Alta', 'Crítica'],
      default: 'Media'
    },
    estado: {
      type: String,
      enum: ['Pendiente', 'En Proceso', 'Resuelto', 'Cerrado'],
      default: 'Pendiente'
    },
    solicitante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    agenteAsignado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);