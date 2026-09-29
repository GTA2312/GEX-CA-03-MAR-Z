const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registrar un nuevo usuario
const register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado.' });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear el usuario con el rol asignado
    const nuevoUsuario = new User({
      nombre,
      email,
      password: passwordHash,
      rol: rol || 'Solicitante'
    });

    await nuevoUsuario.save();

    res.status(201).json({ mensaje: 'Usuario registrado con éxito.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
  }
};

// Iniciar Sesión (Login)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar el usuario por email
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    // Validar contraseña
    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida) {
      return res.status(400).json({ mensaje: 'Contraseña incorrecta.' });
    }

    // Generar Token JWT con ID y Rol del usuario
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
};

module.exports = {
  register,
  login
};