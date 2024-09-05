const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria',
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    descripcion: {
        type: String,
        required: false
    },
    imagen: {
        type: String,
        required: false
    },
    cantidad: {
        type: Number,
        required: true,
        default: 0
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
