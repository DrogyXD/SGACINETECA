// routes/ventaRoutes.js
const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/saleController');
const verifyToken = require('../middlewares/auth');


// Rutas para el carrito
router.post('/agregar', verifyToken, ventaController.agregarProducto);
router.get('/ver/:userId', verifyToken, ventaController.verCarrito);
router.delete('/eliminar/:id', verifyToken, ventaController.eliminarProducto);

// Rutas para ventas
router.post('/vender/:userId', verifyToken, ventaController.realizarVenta);
router.get('/ventas', verifyToken, ventaController.obtenerVentas);
router.get('/ventas/:id', verifyToken, ventaController.obtenerVentaPorId);

module.exports = router;
