import actorService from '../services/actor.service.js'
import pedidoService from '../services/pedido.service.js'
import productoService from '../services/producto.service.js'
import { esPlanta } from '../lib/tiposActor.js'
import { obtenerEstadosPedido } from '../lib/estadosPedido.js'
import { fmtFecha } from '../lib/utils.js'
import { normalizarError, respuestaError } from '../validators/response.validator.js'
import { emitirEventoPedidoActualizado, emitirEventoPedidoEliminado, emitirEventoPedidoNuevo } from '../services/socket.service.js'

// Bases
const listarPedidosBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const actorLogueado = esWeb ? req.session.user : req.user
        const filtro = actorLogueado && esPlanta(actorLogueado) ? {} : { actor: actorLogueado?.id }

        const pedidos = await pedidoService.obtenerPedidos(filtro)

        if (esWeb) {
            const titulo = 'Listado de pedidos'
            return res.render('pedidos/listado', { pedidos, titulo, fmtFecha })
        }

        res.status(200).json(pedidos)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al listar pedidos')
        respuestaError(res, resultado, esWeb)
    }
}

const crearPedidoBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const { fecha_entrega_esperada, id_actor, productos } = req.body
        const nuevo = await pedidoService.crearPedido(fecha_entrega_esperada, id_actor, productos)

        if (esWeb) {
            emitirEventoPedidoNuevo(req, nuevo)
            return res.redirect('/pedidos')
        }

        res.status(201).json(nuevo)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al crear pedido')
        respuestaError(res, resultado, esWeb)
    }
}

const actualizarPedidoBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const id = req.params.id
        const { fecha_entrega_esperada, estado, id_actor, productos } = req.body

        const pedido = await pedidoService.actualizarPedido(id, fecha_entrega_esperada, estado, id_actor, productos)

        if (!pedido) {
            if (esWeb) {
                return res.status(404).render('error', { mensaje: 'Pedido no encontrado' })
            }

            return res.status(404).json({ error: 'Pedido no encontrado' })
        }

        if (esWeb) {
            emitirEventoPedidoActualizado(req, pedido)
            return res.redirect('/pedidos')
        }

        res.status(200).json(pedido)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al actualizar pedido')
        respuestaError(res, resultado, esWeb)
    }
}

const eliminarPedidoBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const id = req.params.id

        const pedido = await pedidoService.eliminarPedido(id)

        if (!pedido) {
            if (esWeb) {
                return res.status(404).render('error', { mensaje: 'Pedido no encontrado' })
            }

            return res.status(404).json({ error: 'Pedido no encontrado' })
        }

        if (esWeb) {
            emitirEventoPedidoEliminado(req, pedido)
            return res.redirect('/pedidos')
        }

        res.status(200).json(pedido)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al eliminar pedido')
        respuestaError(res, resultado, esWeb)
    }
}

// Solo API
const listarPedidoApi = async (req, res) => {
    try {
        const id = req.params.id
        const pedido = await pedidoService.buscarPedidoPorIdConDetalles(id)

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' })
        }

        res.status(200).json(pedido)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al listar pedido')
        respuestaError(res, resultado)
    }
}

// Solo web
const renderFormularioNuevoPedidoWeb = async (req, res) => {
    try {
        const actorLogueado = req.session.user

        const [actores, productos] = await Promise.all([
            esPlanta(actorLogueado)
                ? actorService.obtenerActoresActivos()
                : actorService.buscarActorPorId(actorLogueado.id),
            productoService.obtenerProductosActivos(),
        ])

        const titulo = 'Alta de nuevo pedido'

        res.render('pedidos/nuevo', { actores, productos, titulo })
    } catch (error) {
        const resultado = normalizarError(error, 'Error al cargar formulario nuevo pedido')
        respuestaError(res, resultado, true)
    }
}

const renderFormularioEditarPedidoWeb = async (req, res) => {
    try {
        const id = req.params.id
        const datosPedido = await pedidoService.obtenerPedidoParaEditar(id)

        if (!datosPedido) {
            return res.status(404).render('error', { mensaje: 'Pedido no encontrado' })
        }

        const { pedido, productos } = datosPedido
        const idActor = pedido.actor?._id || pedido.actor

        const [actoresActivos, actorActual] = await Promise.all([
            actorService.obtenerActoresActivos(),
            actorService.buscarActorPorId(idActor),
        ])

        let actores = actoresActivos

        if (actorActual && !actorActual.activo) {
            actores = [...actores, actorActual]
        }

        const estados = obtenerEstadosPedido()
        const titulo = `Editar pedido #${pedido.id}`
        const pedidoFormulario = {
            ...pedido.toObject(),
            id: pedido.id,
            actor: String(idActor),
        }

        res.render('pedidos/editar', {
            pedido: pedidoFormulario,
            actores,
            estados,
            productos,
            titulo,
            fmtFecha,
        })
    } catch (error) {
        const resultado = normalizarError(error, 'Error al cargar formulario editar pedido')
        respuestaError(res, resultado, true)
    }
}

const renderListadoPedidos = async (req, res) => {
    try {
        const actorLogueado = req.session.user
        const filtro = esPlanta(actorLogueado) ? {} : { actor: actorLogueado.id }

        const pedidos = await pedidoService.obtenerPedidos(filtro)

        res.render('pedidos/lista-pedidos', {
            pedidos,
            fmtFecha,
            activo: actorLogueado.activo,
            esPlanta: esPlanta(actorLogueado),
        })
    } catch (error) {
        const resultado = normalizarError(error, 'Error al cargar listado')
        respuestaError(res, resultado, true)
    }
}

// Wrappers
const listarPedidosApi = (req, res) => {
    return listarPedidosBase(req, res, { esWeb: false })
}

const listarPedidosWeb = (req, res) => {
    return listarPedidosBase(req, res, { esWeb: true })
}

const crearPedidoApi = (req, res) => {
    return crearPedidoBase(req, res, { esWeb: false })
}

const crearPedidoWeb = (req, res) => {
    return crearPedidoBase(req, res, { esWeb: true })
}

const actualizarPedidoApi = (req, res) => {
    return actualizarPedidoBase(req, res, { esWeb: false })
}

const actualizarPedidoWeb = (req, res) => {
    return actualizarPedidoBase(req, res, { esWeb: true })
}

const eliminarPedidoApi = (req, res) => {
    return eliminarPedidoBase(req, res, { esWeb: false })
}

const eliminarPedidoWeb = (req, res) => {
    return eliminarPedidoBase(req, res, { esWeb: true })
}

export {
    listarPedidosApi,
    listarPedidosWeb,
    listarPedidoApi,
    crearPedidoApi,
    crearPedidoWeb,
    actualizarPedidoApi,
    actualizarPedidoWeb,
    eliminarPedidoApi,
    eliminarPedidoWeb,
    renderFormularioNuevoPedidoWeb,
    renderFormularioEditarPedidoWeb,
    renderListadoPedidos
}
