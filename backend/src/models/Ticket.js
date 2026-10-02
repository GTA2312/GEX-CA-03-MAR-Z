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
    // Solicitud de cambio Sprint 2: Requeridos cuando la prioridad es Alta o Crítica (HU02 / HU04)
    justificacion: {
      type: String,
      trim: true,
      default: null
    },
    fechaObjetivo: {
      type: Date,
      default: null
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
    // Trazabilidad de prioridad (HU04 - Actualizado para Sprint 2)
    historialPrioridad: [
      {
        prioridadAnterior: String,
        prioridadNueva: String,
        justificacion: { type: String, default: null },
        fechaObjetivo: { type: Date, default: null },
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
    ],
    // Trazabilidad de cambio de estado y conformidad/reapertura (HU07 y HU08)
    historialEstado: [
      {
        estadoAnterior: { type: String, required: true },
        estadoNuevo: { type: String, required: true },
        modificadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        motivo: { type: String, default: '' }, // HU08: Motivo de reapertura o confirmación
        fecha: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Ticket', ticketSchema);