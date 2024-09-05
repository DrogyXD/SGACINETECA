const Categoria = require('../models/category');

// Crear nueva categoría
exports.crearCategoria = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        // Verificar si la categoría ya existe
        let categoriaExistente = await Categoria.findOne({ nombre });
        if (categoriaExistente) {
            return res.status(400).json({ msg: 'La categoría ya existe' });
        }

        // Crear nueva categoría
        const categoria = new Categoria({
            nombre,
            descripcion
        });
        await categoria.save();

        res.status(201).json(categoria);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error');
    }
};

// Obtener todas las categorías
exports.obtenerCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.find({ estado: 'activo' }); // Filtrar categorías activas
        res.json(categorias);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error');
    }
};

// Obtener una categoría por ID
exports.obtenerCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.findById(req.params.id);

        if (!categoria || categoria.estado === 'inactivo') {
            return res.status(404).json({ msg: 'Categoría no encontrada' });
        }

        res.json(categoria);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error');
    }
};

// Actualizar una categoría
exports.actualizarCategoria = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        let categoria = await Categoria.findById(req.params.id);

        if (!categoria || categoria.estado === 'inactivo') {
            return res.status(404).json({ msg: 'Categoría no encontrada' });
        }

        categoria.nombre = nombre || categoria.nombre;
        categoria.descripcion = descripcion || categoria.descripcion;

        categoria = await Categoria.findByIdAndUpdate(req.params.id, categoria, {
            new: true
        });

        res.json(categoria);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error');
    }
};

// Marcar una categoría como inactiva en lugar de eliminarla
exports.eliminarCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.findById(req.params.id);

        if (!categoria || categoria.estado === 'inactivo') {
            return res.status(404).json({ msg: 'Categoría no encontrada' });
        }

        // Cambiar el estado de la categoría a 'inactivo'
        categoria.estado = 'inactivo';
        categoria.fechaEliminacion = new Date(); // Opcional: Añadir fecha de eliminación

        // Guardar los cambios
        await categoria.save();

        res.json({ msg: 'Categoría marcada como inactiva con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error');
    }
};
