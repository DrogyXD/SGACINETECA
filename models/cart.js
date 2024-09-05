// models/cart.js
const mongoose = require('mongoose');

const CarritoSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
        quantity: { type: Number, required: true, min: 1 }
    }]
}, { collection: 'carritos' });

module.exports = mongoose.model('Carrito', CarritoSchema);
