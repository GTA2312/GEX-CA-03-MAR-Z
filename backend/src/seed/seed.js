const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Ticket = require('../models/Ticket');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/marz_db';

const users = [
  {
    _id: new mongoose.Types.ObjectId('6abb2a4c6a42234cbeb20335'),
    nombre: 'Gabriel Troyano',
    email: 'test@correo.com',
    password: '$2b$10$.USLxKVNq7f8Tt6haFRklukqG/pdUWYSv8izilq.txQOucJZFoUfa',
    rol: 'Solicitante',
    createdAt: new Date('2026-09-29T03:02:36.758Z'),
    updatedAt: new Date('2026-09-29T03:02:36.758Z'),
    __v: 0
  },
  {
    _id: new mongoose.Types.ObjectId('6abb2f0487b3ca0f1d34f0cf'),
    nombre: 'Auditor General',
    email: 'auditor@correo.com',
    password: '$2b$10$ccAyb86CQtbtge5EsAbEee7l4/jkiz1I4Hmnm3Keo1oCmGnW.Y.eO',
    rol: 'Auditor',
    createdAt: new Date('2026-09-29T03:22:44.470Z'),
    updatedAt: new Date('2026-09-29T03:22:44.470Z'),
    __v: 0
  },
  {
    _id: new mongoose.Types.ObjectId('6abb3ca1788ec5e80fc1e38b'),
    nombre: 'Carlos Coordinador',
    email: 'coordinador@correo.com',
    password: '$2b$10$KaZKwc9zqXit0Xa.dGFDFu3OsVrqh5sP81tK8O2gVoYlljOxmCl7a',
    rol: 'Coordinador',
    createdAt: new Date('2026-09-29T04:20:49.345Z'),
    updatedAt: new Date('2026-09-29T04:20:49.345Z'),
    __v: 0
  },
  {
    _id: new mongoose.Types.ObjectId('6abc50fdf5c91670f02f084e'),
    nombre: 'Agente Soporte 1',
    email: 'agente1@correo.com',
    password: '$2b$10$/XBc1DR1Wlm4cNotwidbmeKPpGOzEsQkLrI/MwQ/FfJ/QCgvrLvbu',
    rol: 'Agente',
    estado: 'Activo',
    notificaciones: [],
    createdAt: new Date('2026-09-29T23:59:57.088Z'),
    updatedAt: new Date('2026-10-01T02:01:03.733Z'),
    __v: 2
  }
];

const tickets = [
  {
    _id: new mongoose.Types.ObjectId('6abb34db8e5211c741ceef99'),
    titulo: 'Falla de conexion de la red',
    descripcion: 'No conecta el internet',
    categoria: 'Hardware',
    prioridad: 'Baja',
    estado: 'Cerrado',
    solicitante: new mongoose.Types.ObjectId('6abb2a4c6a42234cbeb20335'),
    agenteAsignado: new mongoose.Types.ObjectId('6abc50fdf5c91670f02f084e'),
    historialPrioridad: [],
    historialAsignacion: [],
    comentarios: [],
    historialEstado: [],
    createdAt: new Date('2026-09-29T03:47:39.850Z'),
    updatedAt: new Date('2026-09-30T01:54:31.697Z'),
    __v: 11
  },
  {
    _id: new mongoose.Types.ObjectId('6abb35208e5211c741ceef9a'),
    titulo: 'Falla de conexion de la red',
    descripcion: 'aaaa',
    categoria: 'Hardware',
    prioridad: 'Crítica',
    estado: 'Nuevo',
    solicitante: new mongoose.Types.ObjectId('6abb2a4c6a42234cbeb20335'),
    agenteAsignado: null,
    historialPrioridad: [],
    historialAsignacion: [],
    comentarios: [],
    historialEstado: [],
    createdAt: new Date('2026-09-29T03:48:48.153Z'),
    updatedAt: new Date('2026-09-29T03:48:48.153Z'),
    __v: 0
  },
  {
    _id: new mongoose.Types.ObjectId('6abb363e8e5211c741ceef9b'),
    titulo: 'Falla de conexion de la red',
    descripcion: 'Otro',
    categoria: 'Acceso/Seguridad',
    prioridad: 'Alta',
    estado: 'Cerrado',
    solicitante: new mongoose.Types.ObjectId('6abb2a4c6a42234cbeb20335'),
    agenteAsignado: null,
    historialPrioridad: [],
    historialAsignacion: [],
    comentarios: [],
    historialEstado: [],
    createdAt: new Date('2026-09-29T03:53:34.676Z'),
    updatedAt: new Date('2026-09-30T01:16:03.607Z'),
    __v: 3
  },
  {
    _id: new mongoose.Types.ObjectId('6abdb76296787f3049879981'),
    titulo: 'Fallo en Monitor Dell',
    descripcion: 'Fallo en Monitor Dell',
    categoria: 'Hardware',
    prioridad: 'Alta',
    estado: 'Nuevo',
    solicitante: new mongoose.Types.ObjectId('6abb2a4c6a42234cbeb20335'),
    agenteAsignado: null,
    historialPrioridad: [],
    historialAsignacion: [],
    comentarios: [],
    historialEstado: [],
    createdAt: new Date('2026-10-01T01:29:06.361Z'),
    updatedAt: new Date('2026-10-01T01:29:06.361Z'),
    __v: 0
  },
  {
    _id: new mongoose.Types.ObjectId('6abdb77c96787f3049879990'),
    titulo: 'Error de Licencia Office',
    descripcion: 'Error de Licencia Office',
    categoria: 'Software',
    prioridad: 'Media',
    estado: 'Nuevo',
    solicitante: new mongoose.Types.ObjectId('6abb2a4c6a42234cbeb20335'),
    agenteAsignado: null,
    historialPrioridad: [],
    historialAsignacion: [],
    comentarios: [],
    historialEstado: [],
    createdAt: new Date('2026-10-01T01:29:32.266Z'),
    updatedAt: new Date('2026-10-01T01:29:32.266Z'),
    __v: 1
  },
  {
    _id: new mongoose.Types.ObjectId('6abdb78b96787f304987999f'),
    titulo: 'Caída de Red WiFi Piso 2',
    descripcion: 'Caída de Red WiFi Piso 2',
    categoria: 'Redes',
    prioridad: 'Crítica',
    estado: 'En Proceso',
    solicitante: new mongoose.Types.ObjectId('6abb2a4c6a42234cbeb20335'),
    agenteAsignado: new mongoose.Types.ObjectId('6abc50fdf5c91670f02f084e'),
    historialPrioridad: [],
    historialAsignacion: [],
    comentarios: [],
    historialEstado: [],
    createdAt: new Date('2026-10-01T01:29:47.982Z'),
    updatedAt: new Date('2026-10-01T02:01:03.729Z'),
    __v: 1
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB...');

    await User.deleteMany({});
    await Ticket.deleteMany({});
    console.log('Colecciones anteriores eliminadas.');

    await User.insertMany(users);
    await Ticket.insertMany(tickets);
    console.log('¡Base de datos populada exitosamente con los datos semilla!');

    process.exit(0);
  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
    process.exit(1);
  }
};

seedDatabase();