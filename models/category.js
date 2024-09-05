const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    descripcion: {
        type: String,
        required: false
    },
    estado: {
        type: String,
        enum: ['activo', 'inactivo'],
        default: 'activo'
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    fechaEliminacion: {
        type: Date,
        default: null // Opcional: Puede servir para registrar cuándo se marcó como inactivo
    }
}, { collection: 'categorias' });

module.exports = mongoose.model('Categoria', CategoriaSchema);
