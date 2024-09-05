const mongoose = require('mongoose');

const conectarDB = async () => {
    try {
        const dbUri = 'mongodb+srv://2123200401:Imposible98@clusterdeprueba.wdfctea.mongodb.net/SGACINETECA?retryWrites=true&w=majority&appName=Clusterdeprueba';
        await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Base de datos conectada');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

module.exports = conectarDB;
