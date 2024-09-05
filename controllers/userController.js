const Usuario = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Obtener un usuario
exports.obtenerUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear un nuevo usuario
exports.crearUsuario = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        const emailExistente = await Usuario.findOne({ email });
        if (emailExistente) {
            return res.status(400).json({ message: 'El email ya existe' });
        }

        const usernameExistente = await Usuario.findOne({ username });
        if (usernameExistente) {
            return res.status(400).json({ message: 'El username ya existe' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        const usuario = new Usuario({
            username,
            email,
            password: passwordEncriptada,
            role
        });
        await usuario.save();
        res.status(201).json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar email y role del usuario
exports.actualizarEmailYRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role } = req.body;

        // Buscar usuario por ID
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualizar solo el email y el role si se proporcionan
        if (username) usuario.username = username;
        if (email) usuario.email = email;
        if (role) usuario.role = role;

        await usuario.save();
        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar solo la contraseña del usuario
exports.actualizarPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        // Buscar usuario por ID
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Validar que se haya proporcionado una nueva contraseña
        if (!password) {
            return res.status(400).json({ message: 'La contraseña es requerida' });
        }

        // Encriptar la nueva contraseña y actualizarla
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        usuario.password = hashedPassword;

        await usuario.save();
        console.log('Contraseña actualizada:', usuario.password); // Verificar la contraseña encriptada
        res.status(200).json({ message: 'Contraseña actualizada con éxito' });
    } catch (error) {
        console.error(error); // Mejorar el registro de errores
        res.status(500).json({ error: error.message });
    }
};

// Eliminar usuario
exports.eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        await usuario.deleteOne();
        res.status(200).json({ message: 'Usuario eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
