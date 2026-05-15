import { leerData, guardarData } from "../lib/fs.js"
import Pedido from "../models/Pedido.js"

const COLECCION = "pedidos"
const ESTADOS = "pedido_estado"

const obtenerPedidos = async () => {
    return leerData(COLECCION)
}

const buscarPedidoPorId = async (id) => {
    const pedidos = await obtenerPedidos()
    return pedidos.find(pedido => pedido.id === +id)
}

const obtenerEstados = async () => {
    return leerData(ESTADOS)
}

const obtenerPedidosConActores = async () => {
    const [pedidos, actores] = await Promise.all([
        obtenerPedidos(),
        leerData("actores")
    ])

    return pedidos.map(pedido => {
        const actor = actores.find(actor => actor.id === pedido.id_actor)

        return {
            ...pedido,
            actor: actor || null
        }
    })
}

const crearPedido = async (fechaEntregaEsperada, idActor) => {
    const pedidos = await obtenerPedidos()
    const nuevo = new Pedido(fechaEntregaEsperada, idActor)

    await guardarData(COLECCION, [...pedidos, nuevo])

    return nuevo
}

const actualizarPedido = async (id, fechaEntregaEsperada, fechaEntregaReal, estado, idActor) => {
    const pedidos = await obtenerPedidos()
    const pedido = pedidos.find(pedido => pedido.id === +id)

    if (!pedido) {
        return null
    }

    pedido.fecha_entrega_esperada = fechaEntregaEsperada
    pedido.fecha_entrega_real = fechaEntregaReal?.trim() || null
    pedido.estado = estado.trim()
    pedido.id_actor = +idActor

    await guardarData(COLECCION, pedidos)

    return pedido
}

const eliminarPedido = async (id) => {
    const pedido = await buscarPedidoPorId(id)

    if (!pedido) {
        return null
    }

    const pedidos = await obtenerPedidos()
    const filtrado = pedidos.filter(pedido => pedido.id !== +id)
    await guardarData(COLECCION, filtrado)

    return pedido
}

export default {
    obtenerPedidos,
    buscarPedidoPorId,
    obtenerEstados,
    obtenerPedidosConActores,
    crearPedido,
    actualizarPedido,
    eliminarPedido
}
