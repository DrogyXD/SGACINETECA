const mongoose = require('mongoose');
require('dotenv').config();

const conectarDB = async () => {
    try {
        const dbUri = process.env.DB_MONGO;
        if (!dbUri) {
            throw new Error('La URI de MongoDB no está definida en las variables de entorno');
        }
        await mongoose.connect(dbUri, {
        });
        console.log('Base de datos conectada');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
        process.exit(1);
    }
};

module.exports = conectarDB;
