import Pedido from "../models/Pedido.js"
import detallePedidoService from "./detallePedidoService.js"
import productoService from "./productoService.js"
import { esIdValido } from "../lib/utils.js"
import { ESTADOS_PEDIDO } from "../lib/estadosPedido.js"

const obtenerPedidos = async (filtro = {}) => {
    return await Pedido.find(filtro).populate(['actor', 'productos'])
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
        .populate("actor")
        .populate({
            path: "productos",
            populate: {
                path: "producto"
            }
        })
}

const productoParaFormulario = (producto, cantidad = "") => ({
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    cantidad_pedida: cantidad
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

export default {
    obtenerPedidos,
    buscarPedidoPorId,
    buscarPedidoPorIdConDetalles,
    obtenerPedidoParaEditar,
    crearPedido,
    actualizarPedido,
    eliminarPedido
}
