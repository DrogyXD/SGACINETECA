// controllers/ventaController.js
const Cart = require('../models/cart');
const Product = require('../models/product');
const User = require('../models/user');
const Sale = require('../models/sale');

// Añadir producto al carrito
exports.agregarProducto = async (req, res) => {
    try {
        const { userId, productoId, cantidad } = req.body;

        // Verificar si el usuario existe
        const usuario = await User.findById(userId);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar si el producto existe
        const producto = await Product.findById(productoId);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Verificar si hay suficiente cantidad en inventario
        if (producto.cantidad < cantidad) {
            return res.status(400).json({ message: 'No hay suficiente cantidad disponible' });
        }

        // Encontrar o crear el carrito para el usuario
        let carrito = await Cart.findOne({ user: userId });
        if (!carrito) {
            carrito = new Cart({ user: userId, items: [] });
        }

        // Verificar si el producto ya está en el carrito
        const itemIndex = carrito.items.findIndex(item => item.product.toString() === productoId);
        if (itemIndex > -1) {
            carrito.items[itemIndex].quantity += cantidad;
        } else {
            carrito.items.push({ product: productoId, quantity: cantidad });
        }

        await carrito.save();
        res.status(200).json(carrito);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Ver el carrito del usuario
exports.verCarrito = async (req, res) => {
    try {
        const { userId } = req.params;

        const carrito = await Cart.findOne({ user: userId }).populate('items.product');
        if (!carrito) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        res.status(200).json(carrito);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar producto del carrito
exports.eliminarProducto = async (req, res) => {
    try {
        const { id: carritoId } = req.params; // Obtener el ID del carrito desde los parámetros
        const { productoId } = req.body; // Obtener el ID del producto desde el cuerpo de la solicitud

        // Verificar si el carrito existe
        const carrito = await Cart.findById(carritoId);
        if (!carrito) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        // Buscar el índice del producto en el carrito
        const itemIndex = carrito.items.findIndex(item => item.product.toString() === productoId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
        }

        // Verificar la cantidad del producto
        const item = carrito.items[itemIndex];
        if (item.quantity > 1) {
            // Reducir la cantidad del producto en el carrito
            item.quantity -= 1;
        } else {
            // Eliminar el producto del carrito si la cantidad es 1
            carrito.items.splice(itemIndex, 1);
        }

        await carrito.save();
        res.status(200).json(carrito);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// controllers/ventaController.js
const mongoose = require('mongoose');

// controllers/ventaController.js

exports.realizarVenta = async (req, res) => {
    console.log('Datos recibidos:', req.body);
    try {
        const { items } = req.body;
        const { userId } = req.params; // Obtener userId desde la URL

        // Verificar si hay artículos en la solicitud
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }

        // Verificar si el usuario existe
        const usuario = await User.findById(userId);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Calcular el total basado en los items recibidos
        const total = (await Promise.all(
            items.map(async item => {
                const producto = await Product.findById(item.product._id); // Ajusta la forma de obtener el producto

                // Verifica si el producto existe
                if (!producto) {
                    throw new Error(`Producto con ID ${item.product._id} no encontrado`);
                }

                return producto.precio * item.quantity;
            })
        )).reduce((acc, cur) => acc + cur, 0);

        // Crear la venta
        const venta = new Sale({
            user: userId,
            items: items.map(item => ({
                product: item.product._id, // Ajusta según el formato esperado en tu modelo de venta
                quantity: item.quantity
            })),
            total
        });
        await venta.save();

        // Actualizar el inventario
        await Promise.all(
            items.map(async item => {
                const producto = await Product.findById(item.product._id);

                if (producto) {
                    producto.cantidad -= item.quantity;
                    if (producto.cantidad < 0) producto.cantidad = 0;
                    await producto.save();
                }
            })
        );

        // Vaciar el carrito
        await Cart.deleteOne({ user: userId });

        res.status(201).json({ message: 'Venta realizada con éxito', venta });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Obtener todas las ventas
exports.obtenerVentas = async (req, res) => {
    try {
        const ventas = await Sale.find().populate('user').populate('items.product');
        res.status(200).json(ventas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener una venta específica
exports.obtenerVentaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const venta = await Sale.findById(id).populate('user').populate('items.product');
        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada' });
        }

        res.status(200).json(venta);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
