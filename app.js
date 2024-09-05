const conectarDB = require('./config/conexion');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Rutas
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// Inicializar aplicación
const app = express();

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
conectarDB();

// Configuración del motor de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Crear directorios para imágenes si no existen
const productoImagePath = path.join(__dirname, 'public', 'images', 'productos');
if (!fs.existsSync(productoImagePath)) {
  fs.mkdirSync(productoImagePath, { recursive: true });
}

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Habilitar CORS
app.use(cors());

// Definir rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/users'));
app.use('/api/categorias', require('./routes/category'));
app.use('/api/productos', require('./routes/product'));
app.use('/api/carrito', require('./routes/sale'));

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Hola mundo");
});

// Capturar errores 404 y forward al manejador de errores
app.use(function (req, res, next) {
  next(createError(404));
});

// Manejador de errores
app.use(function (err, req, res, next) {
  console.error(err.stack);

  // Solo muestra el stack en desarrollo
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Renderizar página de error
  res.status(err.status || 500).render('error', {
    title: 'Error en el servidor', // Título de la página de error
    message: err.message || 'Ha ocurrido un error',
    error: err
  });
});

module.exports = app;
