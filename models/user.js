const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    fechaModificacion: {
        type: Date,
        default: Date.now
    }
}, { collection: 'usuarios' });

module.exports = mongoose.model('Usuario', UsuarioSchema);