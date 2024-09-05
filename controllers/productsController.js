const path = require('path');
const fs = require('fs');
const Producto = require('../models/product');

// URL base para las imágenes
const BASE_URL = 'https://sgacineteca-production.up.railway.app/images/productos/';

// Función auxiliar para construir la URL de la imagen
const asset = (imagePath) => {
    return imagePath ? `${BASE_URL}${imagePath}` : null;
};

// Obtener un producto por ID
exports.obtenerProducto = async (req, res) => {
    try {
        let producto = await Producto.findById(req.params.id).populate('categoria');

        if (!producto) {
            return res.status(404).json({ msg: 'No existe el producto' });
        }

        // Asignar la URL completa de la imagen
        if (producto.imagen) {
            producto.imagen = asset(producto.imagen);
        }

        res.json(producto);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error');
    }
};

// Obtener todos los productos
exports.obtenerProductos = async (req, res) => {
    try {
        const productos = await Producto.find({ estado: 'activo' }).populate('categoria');

        // Asignar la URL completa de las imágenes
        const productosConUrl = productos.map(producto => {
            if (producto.imagen) {
                producto.imagen = asset(producto.imagen);
            }
            return producto;
        });

        res.json(productosConUrl);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error');
    }
};

// Crear un nuevo producto
exports.crearProducto = async (req, res) => {
    try {
        const { nombre, categoria, precio, cantidad, descripcion } = req.body;

        let productoExistente = await Producto.findOne({ nombre });
        if (productoExistente) {
            return res.status(400).json({ msg: 'El producto ya existe' });
        }

        if (!nombre || !categoria || !precio || cantidad === undefined) {
            return res.status(400).json({ msg: 'Todos los campos son requeridos' });
        }

        let imagenPath = '';
        if (req.file) {
            imagenPath = req.file.filename;
        }

        const producto = new Producto({
            nombre,
            categoria,
            precio,
            descripcion,
            imagen: imagenPath,
            cantidad,
            estado: cantidad > 0 ? 'activo' : 'agotado'
        });

        await producto.save();

        if (producto.imagen) {
            producto.imagen = asset(producto.imagen);
        }

        res.status(201).json(producto);
    } catch (error) {
        console.error('Error al crear el producto:', error.message);
        res.status(500).send('Hubo un error');
    }
};

// Actualizar un producto existente
exports.actualizarProducto = async (req, res) => {
    try {
        const { nombre, categoria, precio, descripcion, cantidad } = req.body;
        let producto = await Producto.findById(req.params.id);

        if (!producto) {
            return res.status(404).json({ msg: 'Producto no encontrado' });
        }

        if (req.file) {
            producto.imagen = req.file.filename;
        }

        producto.nombre = nombre || producto.nombre;
        producto.categoria = categoria || producto.categoria;
        producto.precio = precio || producto.precio;
        producto.descripcion = descripcion || producto.descripcion;
        producto.cantidad = cantidad || producto.cantidad;
        producto.estado = producto.cantidad > 0 ? 'activo' : 'agotado';

        producto = await Producto.findByIdAndUpdate(req.params.id, producto, { new: true }).populate('categoria');

        if (producto.imagen) {
            producto.imagen = asset(producto.imagen);
        }

        res.json(producto);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error');
    }
};

// Actualizar el stock de un producto
exports.actualizarStockProducto = async (req, res) => {
    try {
        const { cantidad } = req.body;
        let producto = await Producto.findById(req.params.id);

        if (!producto) {
            return res.status(404).json({ msg: 'Producto no encontrado' });
        }

        producto.cantidad += cantidad;

        if (producto.cantidad < 0) {
            return res.status(400).json({ msg: 'La cantidad no puede ser negativa' });
        }

        producto.estado = producto.cantidad === 0 ? 'agotado' : 'activo';

        producto = await Producto.findByIdAndUpdate({ _id: req.params.id }, producto, { new: true }).populate('categoria');
        res.json({
            mensaje: 'Stock actualizado',
            cantidadAnterior: producto.cantidad - cantidad,
            cantidadNueva: producto.cantidad
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error');
    }
};

// Marcar un producto como inactivo en lugar de eliminarlo
exports.eliminarProducto = async (req, res) => {
    try {
        let producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ msg: 'No existe el producto' });
        }

        producto.estado = 'inactivo';
        producto.fechaEliminacion = new Date();

        await producto.save();

        res.json({ msg: 'Producto marcado como inactivo con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error');
    }
};

// Actualizar el estado de un producto
exports.cambiarEstadoProducto = async (req, res) => {
    try {
        let producto = await Producto.findById(req.params.id);

        if (!producto) {
            return res.status(404).json({ msg: 'No existe el producto' });
        }

        producto.estado = req.body.estado || 'inactivo';

        producto = await Producto.findByIdAndUpdate({ _id: req.params.id }, producto, { new: true }).populate('categoria');
        res.json(producto);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error');
    }
};
