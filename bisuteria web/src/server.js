const express = require('express');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de la conexión a PostgreSQL
const client = new Client({
    user: 'NOmbre de la base',
    host: 'localhost',
    database: 'Data base nombre',
    password: 'password',
    port: 5432,
});

// Conexión a PostgreSQL
client.connect()
    .then(() => console.log('Conexión exitosa a PostgreSQL'))
    .catch(err => console.error('Error al conectar a PostgreSQL', err));

// Ruta de inicio
app.get('/', (req, res) => {
    res.send('¡Bienvenido a la plataforma de compras de bisutería!');
});

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(express.json());

// Controlador para manejar las acciones relacionadas con los productos
const productoController = {
    // Método para obtener todos los productos
    obtenerProductos: (req, res) => {
        client.query('SELECT * FROM productos', (err, result) => {
            if (err) {
                console.error('Error al obtener productos:', err);
                res.status(500).json({ error: 'Error interno del servidor' });
                return;
            }
            const productos = result.rows;
            res.json(productos);
        });
    },

    // Método para obtener un producto por su ID
    obtenerProductoPorId: (req, res) => {
        const { id } = req.params;
        client.query('SELECT * FROM productos WHERE id = $1', [id], (err, result) => {
            if (err) {
                console.error('Error al obtener producto por ID:', err);
                res.status(500).json({ error: 'Error interno del servidor' });
                return;
            }
            const producto = result.rows[0];
            if (!producto) {
                res.status(404).json({ error: 'Producto no encontrado' });
                return;
            }
            res.json(producto);
        });
    },

    // Método para crear un nuevo producto
    crearProducto: (req, res) => {
        const { nombre, descripcion, precio, categoria } = req.body;
        client.query('INSERT INTO productos (nombre, descripcion, precio, categoria) VALUES ($1, $2, $3, $4) RETURNING *', [nombre, descripcion, precio, categoria], (err, result) => {
            if (err) {
                console.error('Error al crear producto:', err);
                res.status(500).json({ error: 'Error interno del servidor' });
                return;
            }
            const nuevoProducto = result.rows[0];
            res.status(201).json(nuevoProducto);
        });
    },

    // Método para actualizar un producto existente
    actualizarProducto: (req, res) => {
        const { id } = req.params;
        const { nombre, descripcion, precio, categoria } = req.body;
        client.query('UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, categoria = $4 WHERE id = $5 RETURNING *', [nombre, descripcion, precio, categoria, id], (err, result) => {
            if (err) {
                console.error('Error al actualizar producto:', err);
                res.status(500).json({ error: 'Error interno del servidor' });
                return;
            }
            const productoActualizado = result.rows[0];
            if (!productoActualizado) {
                res.status(404).json({ error: 'Producto no encontrado' });
                return;
            }
            res.json(productoActualizado);
        });
    },

    // Método para eliminar un producto
    eliminarProducto: (req, res) => {
        const { id } = req.params;
        client.query('DELETE FROM productos WHERE id = $1', [id], (err, result) => {
            if (err) {
                console.error('Error al eliminar producto:', err);
                res.status(500).json({ error: 'Error interno del servidor' });
                return;
            }
            res.json({ mensaje: 'Producto eliminado correctamente' });
        });
    }
};

// Rutas para manejar las acciones relacionadas con los productos
app.get('/productos', productoController.obtenerProductos);
app.get('/productos/:id', productoController.obtenerProductoPorId);
app.post('/productos', productoController.crearProducto);
app.put('/productos/:id', productoController.actualizarProducto);
app.delete('/productos/:id', productoController.eliminarProducto);

// Middleware para manejar errores
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Error interno del servidor');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
