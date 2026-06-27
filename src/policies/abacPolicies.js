import { ESTADOS_PEDIDO } from '../lib/estadosPedido.js'
import { esPlanta } from '../lib/tiposActor.js'

const esPedidoPropio = (user, pedido) => {
    return String(pedido.actor) === String(user.id)
}

const puedeVerPedido = (user, pedido = null) => {
    return Boolean(user) && (!pedido || esPlanta(user) || esPedidoPropio(user, pedido))
}

const puedeCrearPedido = (user) => {
    return esPlanta(user) || Boolean(user?.activo)
}

const puedeModificarPedido = (user, pedido) => {
    return (
        esPlanta(user) ||
        (Boolean(user?.activo) &&
            esPedidoPropio(user, pedido) &&
            pedido.estado === ESTADOS_PEDIDO.PENDIENTE)
    )
}

const soloPlanta = (user) => {
    return esPlanta(user)
}

const politicas = {
    actores: {
        ver: soloPlanta,
        crear: soloPlanta,
        editar: soloPlanta,
        cambiarEstado: soloPlanta,
        eliminar: soloPlanta,
    },
    productos: {
        ver: soloPlanta,
        crear: soloPlanta,
        editar: soloPlanta,
        cambiarEstado: soloPlanta,
        eliminar: soloPlanta,
    },
    pedidos: {
        ver: puedeVerPedido,
        crear: puedeCrearPedido,
        editar: puedeModificarPedido,
        eliminar: puedeModificarPedido,
    },
    insumos: {
        ver: soloPlanta,
        crear: soloPlanta,
        editar: soloPlanta,
        cambiarEstado: soloPlanta,
        eliminar: soloPlanta,
    },
    reportes: {
        ver: soloPlanta
    },
    royalties: {
        ver: soloPlanta,
        calcular: soloPlanta,
        cambiarEstado: soloPlanta,
    }
}

export { politicas }
