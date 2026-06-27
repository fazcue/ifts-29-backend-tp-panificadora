import Royalty from '../models/Royalty.js'
import pedidoService from './pedido.service.js'
import detallePedidoService from './detallePedido.service.js'
import { esIdValido } from '../lib/utils.js'
import { ESTADOS_PEDIDO } from '../lib/estadosPedido.js'

const PORCENTAJE_ROYALTY = 0.05

const calcularRoyalty = async (actorId, periodo) => {
    if (!esIdValido(actorId)) return null

    const [ano, mes] = periodo.split('-')
    const inicio = new Date(ano, mes - 1, 1)
    const fin = new Date(ano, mes, 0, 23, 59, 59)

    const pedidos = await pedidoService.obtenerPedidos(
        {
            actor: actorId,
            estado: ESTADOS_PEDIDO.ENTREGADO,
            fecha_entrega_real: { $gte: inicio, $lte: fin },
        },
        { select: '_id', populate: false },
    )

    const idsPedidos = pedidos.map((p) => p._id)
    const totalVentas = await detallePedidoService.obtenerTotalVentasPorPedidos(idsPedidos)
    const monto = parseFloat((totalVentas * PORCENTAJE_ROYALTY).toFixed(2))

    return await Royalty.findOneAndUpdate(
        { actor: actorId, periodo },
        { monto_calculado: monto, estado: 'PENDIENTE' },
        { upsert: true, new: true, runValidators: true },
    )
}

const obtenerRoyalties = async (filtro = {}) => {
    return await Royalty.find(filtro)
        .populate('actor', 'nombre email tipo activo')
        .sort({ periodo: -1, 'actor.nombre': 1 })
}

const cambiarEstadoRoyalty = async (id, nuevoEstado) => {
    if (!esIdValido(id)) return null

    return await Royalty.findByIdAndUpdate(
        id,
        { estado: nuevoEstado },
        { returnDocument: 'after', runValidators: true },
    )
}

const obtenerPeriodosConDatos = async () => {
    return await pedidoService.obtenerPeriodosConDatos()
}

export default {
    calcularRoyalty,
    obtenerRoyalties,
    cambiarEstadoRoyalty,
    obtenerPeriodosConDatos,
}
