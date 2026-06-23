import productoService from '../services/producto.service.js'
import insumoService from '../services/insumo.service.js'
import recetaService from '../services/receta.service.js'
import { normalizarError, respuestaError } from '../validators/response.validator.js'

// Bases
const listarProductosBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const productos = await productoService.obtenerProductos()

        if (esWeb) {
            const titulo = 'Listado de productos'
            return res.render('productos/listado', { productos, titulo })
        }

        res.status(200).json(productos)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al listar productos')
        respuestaError(res, resultado, esWeb)
    }
}

const crearProductoBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const { nombre, precio, activo, insumos } = req.body
        const nuevo = await productoService.crearProducto(nombre, precio, activo, insumos)

        if (esWeb) {
            return res.redirect('/productos')
        }

        res.status(201).json(nuevo)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al crear producto')
        respuestaError(res, resultado, esWeb)
    }
}

const actualizarProductoBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const id = req.params.id
        const { nombre, precio, activo, insumos } = req.body

        const producto = await productoService.actualizarProducto(id, nombre, precio, activo, insumos)

        if (!producto) {
            if (esWeb) {
                return res.status(404).render('error', { mensaje: 'Producto no encontrado' })
            }

            return res.status(404).json({ error: 'Producto no encontrado' })
        }

        if (esWeb) {
            return res.redirect('/productos')
        }

        res.status(200).json(producto)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al actualizar producto')
        respuestaError(res, resultado, esWeb)
    }
}

const eliminarProductoBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const id = req.params.id

        const producto = await productoService.eliminarProducto(id)

        if (!producto) {
            if (esWeb) {
                return res.status(404).render('error', { mensaje: 'Producto no encontrado' })
            }

            return res.status(404).json({ error: 'Producto no encontrado' })
        }

        if (esWeb) {
            return res.redirect('/productos')
        }

        res.status(200).json(producto)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al eliminar producto')
        respuestaError(res, resultado, esWeb)
    }
}

// Solo API
const listarProductoApi = async (req, res) => {
    try {
        const id = req.params.id

        const producto = await productoService.buscarProductoPorId(id)

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' })
        }

        res.status(200).json(producto)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al listar producto')
        respuestaError(res, resultado)
    }
}

// Solo web
const formularioNuevoProductoWeb = async (req, res) => {
    try {
        const insumos = await insumoService.obtenerInsumosActivos()
        const titulo = 'Alta de nuevo producto'

        res.render('productos/nuevo', { insumos, titulo })
    } catch (error) {
        const resultado = normalizarError(error, 'Error al cargar formulario nuevo producto')
        respuestaError(res, resultado, true)
    }
}

const formularioEditarProductoWeb = async (req, res) => {
    try {
        const id = req.params.id

        const [producto, insumosActivos, recetaActual] = await Promise.all([
            productoService.buscarProductoPorId(id),
            insumoService.obtenerInsumosActivos(),
            recetaService.obtenerInsumosPorProducto(id),
        ])

        if (!producto) {
            return res
                .status(404)
                .render('error', { mensaje: 'Producto no encontrado' })
        }

        // Insumos de la receta actual (ya poblados, incluye inactivos)
        const insumosDeLaReceta = recetaActual
            .filter(item => item.insumo)
            .map(item => ({
                ...item.insumo.toObject(),
                id: item.insumo.id,
                cantidad_necesaria: item.cantidad_necesaria,
            }))

        // IDs de insumos ya en la receta
        const idsInsumosReceta = new Set(insumosDeLaReceta.map(i => i.id))

        // Activos que NO están en la receta (para poder agregarlos nuevos)
        const insumosActivosNoIncluidos = insumosActivos
            .filter(i => !idsInsumosReceta.has(i.id))
            .map(i => ({
                ...i.toObject(),
                id: i.id,
                cantidad_necesaria: '',
            }))

        // Combinar (mismo patrón que pedidos)
        const insumos = [...insumosDeLaReceta, ...insumosActivosNoIncluidos]

        const titulo = `Editar producto '${producto.nombre}'`

        res.render('productos/editar', { producto, insumos, titulo })
    } catch (error) {
        const resultado = normalizarError(error, 'Error al cargar formulario editar producto')
        respuestaError(res, resultado, true)
    }
}

const cambiarEstadoProductoWeb = async (req, res) => {
    try {
        const id = req.params.id

        const producto = await productoService.cambiarEstadoProducto(id)

        if (!producto) {
            return res
                .status(404)
                .render('error', { mensaje: 'Producto no encontrado' })
        }

        res.redirect('/productos')
    } catch (error) {
        const resultado = normalizarError(error, 'Error al cambiar estado')
        respuestaError(res, resultado, true)
    }
}

// Wrappers
const listarProductosApi = (req, res) => {
    return listarProductosBase(req, res, { esWeb: false })
}

const listarProductosWeb = (req, res) => {
    return listarProductosBase(req, res, { esWeb: true })
}

const crearProductoApi = (req, res) => {
    return crearProductoBase(req, res, { esWeb: false })
}

const crearProductoWeb = (req, res) => {
    return crearProductoBase(req, res, { esWeb: true })
}

const actualizarProductoApi = (req, res) => {
    return actualizarProductoBase(req, res, { esWeb: false })
}

const actualizarProductoWeb = (req, res) => {
    return actualizarProductoBase(req, res, { esWeb: true })
}

const eliminarProductoApi = (req, res) => {
    return eliminarProductoBase(req, res, { esWeb: false })
}

const eliminarProductoWeb = (req, res) => {
    return eliminarProductoBase(req, res, { esWeb: true })
}

export {
    listarProductosApi,
    listarProductosWeb,
    listarProductoApi,
    crearProductoApi,
    crearProductoWeb,
    actualizarProductoApi,
    actualizarProductoWeb,
    eliminarProductoApi,
    eliminarProductoWeb,
    formularioNuevoProductoWeb,
    formularioEditarProductoWeb,
    cambiarEstadoProductoWeb,
}
