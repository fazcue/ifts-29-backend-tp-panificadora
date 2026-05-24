import productoService from "../../services/productoService.js"

const listarProductos = async (req, res) => {
    try {
        const productos = await productoService.obtenerProductos()

        res.status(200).json(productos)
    } catch (error) {
        res.status(500).json({ error: "Error al listar productos" })
    }
}

const listarProducto = async (req, res) => {
    try {
        const id = req.params.id
        const producto = await productoService.buscarProductoPorId(id)

        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" })
        }

        res.status(200).json(producto)
    } catch (error) {
        res.status(500).json({ error: "Error al listar producto" })
    }
}

const crearProducto = async (req, res) => {
    try {
        const { nombre, precio, activo } = req.body

        const nuevo = await productoService.crearProducto(nombre, precio, activo)

        res.status(201).json(nuevo)
    } catch (error) {
        res.status(500).json({ error: "Error al crear producto" })
    }
}

const actualizarProducto = async (req, res) => {
    try {
        const id = req.params.id
        const { nombre, precio, activo } = req.body

        const producto = await productoService.actualizarProducto(id, nombre, precio, activo)

        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" })
        }

        res.status(200).json(producto)
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar producto" })
    }
}

const eliminarProducto = async (req, res) => {
    try {
        const id = req.params.id

        const producto = await productoService.eliminarProducto(id)

        if (!producto) {
            return res.status(404).json({ error: "Producto no encontrado" })
        }

        res.status(200).json(producto)
    } catch (error) {
        res.status(error.estado || 500).json({ error: error.message || "Error al eliminar producto" })
    }
}

export { listarProductos, listarProducto, crearProducto, actualizarProducto, eliminarProducto }
