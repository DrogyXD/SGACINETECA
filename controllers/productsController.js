const path = require('path');
const fs = require('fs');
const Producto = require('../models/product');

// URL base para las imágenes
const BASE_URL = 'https://sgacineteca-production.up.railway.app';

// Imagen por defecto
const IMAGEN_POR_DEFECTO = '/images/productos/1725509643421-descarga1.jpeg';

// Función auxiliar para construir la URL de la imagen
const asset = (imagePath) => {
    return imagePath ? `${BASE_URL}${imagePath.replace(/\/+images\/productos\//, '/images/productos/')}` : null;
};

// Obtener todos los productos (activos e inactivos)
exports.obtenerTodosLosProductos = async (req, res) => {
    try {
        // Traer todos los productos sin filtrar por estado
        const productos = await Producto.find()
            .select('nombre precioVenta imagen categoria cantidad estado unidadMedida impuesto descuento ventasTotales codigoBarras ubicacion') // Proyección de campos necesarios
            .populate({
                path: 'categoria',
                select: 'nombre'
            })
            .lean(); // Usar lean() para mejorar el rendimiento

        // Agregar URL completa a las imágenes de forma no destructiva
        const productosConUrl = productos.map(producto => ({
            ...producto,
            imagen: producto.imagen ? asset(producto.imagen) : null
        }));

        res.json(productosConUrl);
    } catch (error) {
        console.error('Error al obtener los productos:', error.message);
        res.status(500).json({ msg: 'Hubo un error al obtener los productos' });
    }
};

// Obtener un producto por ID
exports.obtenerProducto = async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id)
            .select('nombre precioVenta descripcion imagen categoria cantidad estado') // Proyección de solo campos necesarios
            .populate('categoria', 'nombre')
            .lean();

        if (!producto) {
            return res.status(404).json({ msg: 'Producto no encontrado' });
        }

        // Agregar URL completa a la imagen si existe
        producto.imagen = producto.imagen ? asset(producto.imagen) : null;

        res.json(producto);
    } catch (error) {
        console.error('Error al obtener el producto:', error.message);
        res.status(500).json({ msg: 'Hubo un error al obtener el producto' });
    }
};

// Obtener todos los productos 
exports.obtenerProductosParaVenta = async (req, res) => {
    try {
        // Filtrar productos activos y solo traer campos necesarios
        const productos = await Producto.find({ estado: 'activo' })
            .select('nombre precioVenta imagen categoria cantidad') // Proyección de solo campos necesarios
            .populate({
                path: 'categoria',
                select: 'nombre'
            })
            .lean(); // Usar lean() para mejorar el rendimiento

        // Agregar URL completa a las imágenes de forma no destructiva
        const productosConUrl = productos.map(producto => ({
            ...producto,
            imagen: producto.imagen ? asset(producto.imagen) : null
        }));

        res.json(productosConUrl);
    } catch (error) {
        console.error('Error al obtener productos:', error.message);
        res.status(500).json({ msg: 'Hubo un error al obtener los productos' });
    }
};

// Crear un nuevo producto
exports.crearProducto = async (req, res) => {
    try {
        const { nombre, categoria, precioCompra, precioVenta, cantidad, descripcion } = req.body;

        // Validar campos requeridos
        if (!nombre || !categoria || !precioCompra || !precioVenta || cantidad === undefined) {
            return res.status(400).json({ msg: 'Todos los campos son requeridos' });
        }

        // Verificar si el producto ya existe
        const productoExistente = await Producto.findOne({ nombre });
        if (productoExistente) {
            return res.status(400).json({ msg: 'El producto ya existe' });
        }

        // Si no se subió imagen, asignar imagen por defecto
        let imagenPath = req.file ? `/images/productos/${req.file.filename}` : IMAGEN_POR_DEFECTO;

        const nuevoProducto = new Producto({
            nombre,
            categoria,
            precioCompra,
            precioVenta,
            descripcion,
            imagen: imagenPath,
            cantidad,
            estado: cantidad > 0 ? 'activo' : 'agotado'
        });

        await nuevoProducto.save();

        // Asignar la URL completa de la imagen
        nuevoProducto.imagen = asset(nuevoProducto.imagen);

        res.status(201).json(nuevoProducto);
    } catch (error) {
        console.error('Error al crear el producto:', error.message);
        res.status(500).json({ msg: 'Hubo un error al crear el producto' });
    }
};

// Actualizar un producto
exports.actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, categoria, precioCompra, precioVenta, cantidad, descripcion, stockMinimo, impuesto, unidadMedida, descuento } = req.body;

        // Verificar si el producto existe
        let producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ msg: 'No existe el producto' });
        }

        // Verificar si hay una imagen nueva
        let nuevaImagenPath = producto.imagen; // Mantener la imagen existente por defecto
        if (req.file) {
            nuevaImagenPath = `/images/productos/${req.file.filename}`;

            // Eliminar la imagen antigua si no es la imagen por defecto
            if (producto.imagen && producto.imagen !== '/images/productos/imagen_por_defecto.jpeg') {
                const antiguaImagenPath = path.join(__dirname, `../public${producto.imagen}`);
                if (fs.existsSync(antiguaImagenPath)) {
                    fs.unlinkSync(antiguaImagenPath);
                }
            }
        }

        // Actualizar solo los campos que fueron enviados en la solicitud (req.body)
        const nuevosDatos = {
            nombre: nombre || producto.nombre,
            categoria: categoria || producto.categoria,
            precioCompra: precioCompra !== undefined ? precioCompra : producto.precioCompra,
            precioVenta: precioVenta !== undefined ? precioVenta : producto.precioVenta,
            cantidad: cantidad !== undefined ? cantidad : producto.cantidad,
            descripcion: descripcion || producto.descripcion,
            stockMinimo: stockMinimo !== undefined ? stockMinimo : producto.stockMinimo,
            impuesto: impuesto !== undefined ? impuesto : producto.impuesto,
            unidadMedida: unidadMedida || producto.unidadMedida,
            descuento: descuento !== undefined ? descuento : producto.descuento,
            imagen: nuevaImagenPath,
            estado: cantidad > 0 ? 'activo' : 'agotado', // Actualiza el estado según el stock
        };

        // Actualizar el producto en la base de datos
        producto = await Producto.findByIdAndUpdate(id, { $set: nuevosDatos }, { new: true });

        // Asignar la URL completa de la imagen al producto actualizado
        producto.imagen = asset(producto.imagen);

        res.json(producto);
    } catch (error) {
        console.error('Error al actualizar el producto:', error.message);
        res.status(500).send('Hubo un error al actualizar el producto');
    }
};

// Actualizar el stock de un producto
exports.actualizarStockProducto = async (req, res) => {
    try {
        const { cantidad } = req.body;

        // Buscar el producto por ID
        let producto = await Producto.findById(req.params.id).populate('categoria');

        if (!producto) {
            return res.status(404).json({ msg: 'Producto no encontrado' });
        }

        const cantidadAnterior = producto.cantidad; // Guardamos la cantidad actual

        // Verificamos que no se reduzca más de lo disponible
        if (cantidadAnterior + cantidad < 0) {
            return res.status(400).json({ msg: 'La cantidad no puede ser negativa' });
        }

        // Actualizamos la cantidad
        producto.cantidad += cantidad;
        producto.estado = producto.cantidad === 0 ? 'agotado' : 'activo';

        // Guardamos el producto actualizado
        await producto.save();

        res.json({
            mensaje: 'Stock actualizado',
            cantidadAnterior: cantidadAnterior,
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
