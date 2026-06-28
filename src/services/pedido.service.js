import Pedido from '../models/Pedido.js'
import detallePedidoService from './detallePedido.service.js'
import productoService from './producto.service.js'
import actorService from './actor.service.js'
import { esIdValido, fmtFecha } from '../lib/utils.js'
import { ESTADOS_PEDIDO, obtenerEstadosPedido } from '../lib/estadosPedido.js'

const obtenerPedidos = async (filtro = {}, opciones = {}) => {
    let query = Pedido.find(filtro)

    if (opciones.select) {
        query = query.select(opciones.select)
    }

    if (opciones.populate !== false) {
        query = query.populate([
            'actor',
            {
                path: 'productos',
                populate: {
                    path: 'producto',
                },
            },
        ])
    }

    return await query
}

const obtenerPeriodosConDatos = async () => {
    const periodos = await Pedido.distinct('fecha_entrega_real', {
        fecha_entrega_real: { $ne: null },
    })

    const set = new Set()
    periodos.forEach((fecha) => {
        const mes = String(fecha.getMonth() + 1).padStart(2, '0')
        const anio = fecha.getFullYear()
        set.add(`${anio}-${mes}`)
    })

    return [...set].sort().reverse()
}

const buscarPedidoPorId = async (id, atributos = null) => {
    if (!esIdValido(id)) {
        return null
    }

    return await Pedido.findById(id).select(atributos)
}

const buscarPedidoPorIdConDetalles = async (id) => {
    if (!esIdValido(id)) {
        return null
    }

    return await Pedido.findById(id)
        .populate('actor')
        .populate({
            path: 'productos',
            populate: {
                path: 'producto'
            }
        })
}

const productoParaFormulario = (producto, cantidad = '') => ({
    ...(producto.toObject ? producto.toObject() : producto),
    id: producto.id,
    cantidad_pedida: cantidad || ''
})

const obtenerPedidoParaEditar = async (id) => {
    const pedido = await buscarPedidoPorIdConDetalles(id)

    if (!pedido) {
        return null
    }

    const productosDelPedido = (pedido.productos || [])
        .filter((detalle) => detalle.producto)
        .map((detalle) => productoParaFormulario(detalle.producto, detalle.cantidad))

    const idsProductosDelPedido = new Set(productosDelPedido.map((producto) => producto.id))
    const productosActivos = await productoService.obtenerProductosActivos()
    const productosActivosNoIncluidos = productosActivos
        .filter((producto) => !idsProductosDelPedido.has(producto.id))
        .map((producto) => productoParaFormulario(producto))

    return {
        pedido,
        productos: [
            ...productosDelPedido,
            ...productosActivosNoIncluidos
        ]
    }
}

const crearPedido = async (fechaEntregaEsperada, idActor, productos) => {
    let nuevo = null

    try {
        // crear pedido
        nuevo = new Pedido({
            fecha_entrega_esperada: fechaEntregaEsperada,
            actor: idActor
        })

        await nuevo.save()

        // crear detalles
        await detallePedidoService.crearDetallesPedido(nuevo.id, productos)

        return nuevo
    } catch (error) {
        // si falla la creacion del pedido, elimimar datos huerfanos
        if (nuevo?.id) {
            await detallePedidoService.eliminarDetallesPorPedido(nuevo.id)
            await Pedido.findByIdAndDelete(nuevo.id)
        }

        throw error
    }
}

const actualizarPedido = async (id, fechaEntregaEsperada, estado, idActor, productos = null) => {
    if (!esIdValido(id)) {
        return null
    }

    const pedidoActual = await Pedido.findById(id)

    if (!pedidoActual) {
        return null
    }

    const estadoActualizado = estado?.trim()
    const fechaEntregaReal = estadoActualizado === ESTADOS_PEDIDO.ENTREGADO
        ? pedidoActual.fecha_entrega_real || new Date()
        : null

    const datosActualizados = {
        fecha_entrega_esperada: fechaEntregaEsperada,
        fecha_entrega_real: fechaEntregaReal,
        estado: estadoActualizado,
        actor: idActor
    }

    const pedido = await Pedido.findByIdAndUpdate(
        id,
        datosActualizados,
        { returnDocument: 'after', runValidators: true }
    )

    if (!pedido) {
        return null
    }

    // Guardar referencia al actor anterior para notificaciones socket
    pedido.idActorAntiguo = pedidoActual.actor

    if (productos) {
        await detallePedidoService.eliminarDetallesPorPedido(id)
        await detallePedidoService.crearDetallesPedido(id, productos)
    }

    return pedido
}

const eliminarPedido = async (id) => {
    if (!esIdValido(id)) {
        return null
    }

    // comprobar que exista
    const pedido = await Pedido.findById(id)

    if (!pedido) {
        return null
    }

    // eliminar detalles / pedido
    await detallePedidoService.eliminarDetallesPorPedido(id)
    await Pedido.findByIdAndDelete(id)

    return pedido
}

const productosExistentesPedido = (pedido) => {
    return (pedido.productos || [])
        .filter((detalle) => detalle.producto)
        .map((detalle) => ({
            id_producto: detalle.producto._id || detalle.producto,
            precio_unitario: detalle.precio_unitario,
        }))
}

const obtenerDatosParaCrearPedido = async (fecha_entrega_esperada, id_actor) => {
    const [actoresActivos, productosActivos] = await Promise.all([
        actorService.obtenerActoresActivos(),
        productoService.obtenerProductosActivos(),
    ])

    return {
        pedido: {
            fecha_entrega_esperada,
            actor: id_actor,
        },
        actores: actoresActivos,
        productos: productosActivos,
    }
}

const obtenerDatosParaActualizarPedido = async (id, fecha_entrega_esperada, estado, id_actor, productos = []) => {
    const [actoresActivos, productosActivos, estados, pedidoActual] = await Promise.all([
        actorService.obtenerActoresActivos(),
        productoService.obtenerProductosActivos(),
        obtenerEstadosPedido(),
        buscarPedidoPorIdConDetalles(id),
    ])

    // Productos del pedido actual (ya poblados, incluye inactivos)
    const productosDelPedido = (pedidoActual?.productos || [])
        .filter((detalle) => detalle.producto)
        .map((detalle) => {
            const pf = productos.find(
                (item) => String(item.id_producto) === String(detalle.producto.id),
            )

            return productoParaFormulario(
                detalle.producto,
                Number(pf?.cantidad) > 0 ? pf.cantidad : detalle.cantidad,
            )
        })

    // IDs de productos ya en el pedido
    const idsProductosDelPedido = new Set(productosDelPedido.map((p) => p.id))

    // Activos que NO están en el pedido (para poder agregarlos nuevos)
    const productosActivosNoIncluidos = productosActivos
        .filter((p) => !idsProductosDelPedido.has(p.id))
        .map((p) => {
            const pf = productos.find((item) => String(item.id_producto) === String(p.id))

            return productoParaFormulario(p, Number(pf?.cantidad) > 0 ? pf.cantidad : '')
        })

    const basePedido = pedidoActual
        ? pedidoActual.toObject({ virtuals: true })
        : {}

    return {
        pedido: {
            ...basePedido,
            fecha_entrega_esperada,
            fecha_entrega_real: pedidoActual?.fecha_entrega_real,
            estado,
            actor: id_actor,
        },
        actores: actoresActivos,
        estados,
        productos: [
            ...productosDelPedido,
            ...productosActivosNoIncluidos,
        ],
        fmtFecha,
    }
}

export default {
    obtenerPedidos,
    buscarPedidoPorId,
    buscarPedidoPorIdConDetalles,
    obtenerPedidoParaEditar,
    crearPedido,
    actualizarPedido,
    eliminarPedido,
    productoParaFormulario,
    productosExistentesPedido,
    obtenerDatosParaCrearPedido,
    obtenerDatosParaActualizarPedido,
    obtenerPeriodosConDatos,
}
