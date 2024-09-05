const mongoose = require('mongoose');
require('dotenv').config();

const conectarDB = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO, {
        });
        console.log('Base de datos conectada');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

module.exports = conectarDB;
