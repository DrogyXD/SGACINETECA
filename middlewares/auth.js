const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();

const { SECRETA } = process.env;

const verifyToken = (req, res, next) => {
    const token = req.header('x-auth-token');  // Asegúrate de que el token se pasa en este header

    if (!token) {
        return res.status(403).json({ msg: 'No se ha enviado el token de autenticación' });
    }

    try {
        const decoded = jwt.verify(token, SECRETA);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).send("Token inválido");
    }
}

module.exports = verifyToken;