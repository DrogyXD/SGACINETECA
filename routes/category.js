const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoryController');
const verifyToken = require('../middlewares/auth');

// Rutas para categorías
router.get('/', categoriaController.obtenerCategorias);
router.get('/:id', categoriaController.obtenerCategoria);
router.post('/', verifyToken, categoriaController.crearCategoria); // Sin multer
router.put('/:id', verifyToken, categoriaController.actualizarCategoria); // Sin multer
router.delete('/:id', verifyToken, categoriaController.eliminarCategoria);
module.exports = router;
