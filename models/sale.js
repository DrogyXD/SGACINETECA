// models/venta.js
const mongoose = require('mongoose');

const VentaSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
        quantity: { type: Number, required: true }
    }],
    total: { type: Number, required: true },
    date: { type: Date, default: Date.now }
}, { collection: 'ventas' });

module.exports = mongoose.model('Venta', VentaSchema);
