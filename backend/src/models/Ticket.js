const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio.'],
      trim: true
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria.']
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria.'],
      enum: ['Hardware', 'Software', 'Redes', 'Acceso/Seguridad', 'Otros'],
      trim: true
    },
    prioridad: {
      type: String,
      enum: ['Baja', 'Media', 'Alta', 'Crítica'],
      default: 'Media'
    },
    estado: {
      type: String,
      enum: ['Nuevo', 'En Proceso', 'Resuelto', 'Cerrado'],
      default: 'Nuevo'
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
    },
    // Trazabilidad de prioridad (HU04)
    historialPrioridad: [
      {
        prioridadAnterior: String,
        prioridadNueva: String,
        modificadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fecha: { type: Date, default: Date.now }
      }
    ],
    // Trazabilidad de asignación (HU05)
    historialAsignacion: [
      {
        agenteAnterior: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        agenteNuevo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        asignadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fecha: { type: Date, default: Date.now }
      }
    ],
    // Registro inmutable de comentarios de avance (HU06)
    comentarios: [
      {
        texto: {
          type: String,
          required: [true, 'El comentario no puede estar vacío.'],
          trim: true
        },
        autor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        fecha: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Ticket', ticketSchema);