import productoService from "../../services/productoService.js"

const listarProductosWeb = async (req, res) => {
    try {
        const productos = await productoService.obtenerProductos()
        const titulo = "Listado de productos"

        res.render("productos/listado", { productos, titulo })
    } catch (error) {
        res.status(500).render("error", { mensaje: "Error al cargar listado de productos" })
    }
}

const formularioNuevoProductoWeb = async (req, res) => {
    try {
        const titulo = "Alta de nuevo producto"

        res.render("productos/nuevo", { titulo })
    } catch (error) {
        res.status(500).render("error", { mensaje: "Error al cargar formulario nuevo producto" })
    }
}

const crearProductoWeb = async (req, res) => {
    try {
        const { nombre, precio } = req.body

        await productoService.crearProducto(nombre, precio)

        res.redirect("/productos")
    } catch (error) {
        res.status(500).render("error", { mensaje: "Error al crear producto" })
    }
}

const formularioEditarProductoWeb = async (req, res) => {
    try {
        const id = req.params.id
        const producto = await productoService.buscarProductoPorId(id)

        if (!producto) {
            return res.status(404).render("error", { mensaje: "Producto no encontrado" })
        }

        const titulo = `Editar producto "${producto.nombre}"`

        res.render("productos/editar", { producto, titulo })
    } catch (error) {
        res.status(500).render("error", { mensaje: "Error al cargar formulario editar producto" })
    }
}

const actualizarProductoWeb = async (req, res) => {
    try {
        const id = req.params.id
        const { nombre, precio } = req.body

        const producto = await productoService.actualizarProducto(id, nombre, precio)

        if (!producto) {
            return res.status(404).render("error", { mensaje: "Producto no encontrado" })
        }

        res.redirect("/productos")
    } catch (error) {
        res.status(500).render("error", { mensaje: "Error al actualizar producto" })
    }
}

const activarDesactivarProductoWeb = async (req, res) => {
    try {
        const id = req.params.id

        const producto = await productoService.cambiarEstadoProducto(id)

        if (!producto) {
            return res.status(404).render("error", { mensaje: "Producto no encontrado" })
        }

        res.redirect("/productos")
    } catch (error) {
        res.status(500).render("error", { mensaje: "Error al cambiar estado" })
    }
}

const eliminarProductoWeb = async (req, res) => {
    try {
        const id = req.params.id

        const producto = await productoService.eliminarProducto(id)

        if (!producto) {
            return res.status(404).render("error", { mensaje: "Producto no encontrado" })
        }

        res.redirect("/productos")
    } catch (error) {
        const mensaje = error.message ?? "Error al eliminar producto"
        res.status(500).render("error", { mensaje: mensaje })
    }
}

export {
    listarProductosWeb,
    formularioNuevoProductoWeb,
    crearProductoWeb,
    formularioEditarProductoWeb,
    actualizarProductoWeb,
    activarDesactivarProductoWeb,
    eliminarProductoWeb,
}
