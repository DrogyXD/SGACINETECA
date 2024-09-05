// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// middleware/authMiddleware.js
exports.authRole = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};


