const conectarDB = require('./config/conexion');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

dotenv.config();

// Conectar a la base de datos
conectarDB();
// view engine setup


// Crear los directorios para imágenes si no existen
const productoImagePath = path.join(__dirname, 'public', 'images', 'productos');

if (!fs.existsSync(productoImagePath)) {
  fs.mkdirSync(productoImagePath, { recursive: true });
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Habilitar CORS
app.use(cors());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/users'));
app.use('/api/categorias', require('./routes/category'));
app.use('/api/productos', require('./routes/product'));
app.use('/api/carrito', require('./routes/sale'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.get("/", (req, res) => {
  res.send("Hola mundo");
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
