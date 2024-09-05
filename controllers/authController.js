const Usuario = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Inicio de sesión
exports.iniciarSesion = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario por email
        const usu = await Usuario.findOne({ email: email }); 
        if (!usu) {
            return res.status(400).json({ message: "Usuario o contraseñaaaa incorrectos" });
        }

        // Verificar contraseña
        const esValida = await bcrypt.compare(password, usu.password);
        if (!esValida) {
            return res.status(400).json({ message: "Usuario o contraseña incorrectos" });
        }

        // Generar JWT
        const jwtoken = jwt.sign({ id: usu._id }, process.env.SECRETA, { expiresIn: '16h' });

        const usu_enviado = {
            msj: "Bienvenido",
            email: usu.email,
            jwtoken: jwtoken
        };

        res.status(200).json(usu_enviado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.registrarUsuario = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!email || !password || !role) { // username es opcional
            return res.status(400).json({ message: 'Email, password y role son requeridos' });
        }

        const emailExistente = await Usuario.findOne({ email });
        if (emailExistente) {
            return res.status(400).json({ message: 'El email ya existe' });
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

        // Generar JWT
        const jwtoken = jwt.sign({ id: usuario._id }, process.env.SECRETA, { expiresIn: '1h' });

        res.status(201).json({ usuario, jwtoken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
