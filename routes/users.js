const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/auth');

// Rutas protegidas con verifyToken
router.get('/:id', verifyToken, userController.obtenerUsuario);
router.get('/', verifyToken, userController.obtenerUsuarios);
router.post('/', verifyToken, userController.crearUsuario);  // Solo admin puede crear usuarios
router.put('/:id', verifyToken, userController.actualizarEmailYRole);  // Solo admin puede actualizar email y role
router.put('/:id/password', verifyToken, userController.actualizarPassword);
router.delete('/:id', verifyToken, userController.eliminarUsuario);  // Solo admin puede eliminar usuarios

module.exports = router;
