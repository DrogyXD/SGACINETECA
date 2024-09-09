const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria',
        required: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    imagen: {
        type: String
    },
    cantidad: {
        type: Number,
        required: true,
        default: 0
    },
    stockMinimo: {
        type: Number,
        default: 10, // Definir un stock mínimo por defecto
        min: 0
    },
    ventasTotales: {
        type: Number,
        default: 0, // Registrar la cantidad total de productos vendidos
        min: 0
    },
    precioCompra: {
        type: Number,
        required: true,
        min: 0
    },
    precioVenta: {
        type: Number,
        required: true,
        min: 0
    },
    impuesto: {
        type: Number,
        default: 0, // Porcentaje de impuestos aplicable al producto
        min: 0,
        max: 100 // Asumiendo que el impuesto es un porcentaje
    },
    unidadMedida: {
        type: String,
        enum: ['pieza', 'kilo', 'litro', 'metro', 'paquete'], // Agregar las unidades que se manejan
        default: 'pieza'
    },
    codigoBarras: {
        type: String,
        unique: true // El código de barras debe ser único para cada producto
    },
    descuento: {
        type: Number,
        default: 0, // Porcentaje de descuento aplicable
        min: 0,
        max: 100
    },
    ubicacion: {
        type: String,
        trim: true // Ubicación del producto en el almacén o tienda
    },
    estado: {
        type: String,
        enum: ['activo', 'inactivo', 'agotado'],
        default: 'activo'
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
}, { collection: 'productos' });

module.exports = mongoose.model('Producto', ProductoSchema);
