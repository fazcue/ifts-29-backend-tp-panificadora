import Pedido from '../models/Pedido.js'
import Producto from '../models/Producto.js'
import DetallePedido from '../models/DetallePedido.js'
import { ESTADOS_PEDIDO } from '../lib/estadosPedido.js'

const ESTADOS_DEMANDA = [ESTADOS_PEDIDO.PENDIENTE, ESTADOS_PEDIDO.EN_PRODUCCION]

const obtenerDemandaConsolidada = () => {
    return Pedido.aggregate([
        {
            $match: {
                estado: { $in: ESTADOS_DEMANDA }
            }
        },
        {
            $lookup: {
                from: DetallePedido.collection.name,
                localField: '_id',
                foreignField: 'pedido',
                as: 'detalles'
            }
        },
        {
            $unwind: '$detalles'
        },
        {
            $group: {
                _id: '$detalles.producto',
                cantidad: { $sum: '$detalles.cantidad' }
            }
        },
        {
            $lookup: {
                from: Producto.collection.name,
                localField: '_id',
                foreignField: '_id',
                as: 'producto'
            }
        },
        {
            $unwind: '$producto'
        },
        {
            $project: {
                _id: 0,
                producto: '$producto.nombre',
                cantidad: 1
            }
        },
        {
            $sort: {
                cantidad: -1,
                producto: 1
            }
        }
    ])
}

const obtenerRetrasosEntregas = () => {
    const hoy = new Date()
    hoy.setHours(23, 59, 59, 999)  // final del día de hoy

    return Pedido.find({
        estado: { $ne: ESTADOS_PEDIDO.ENTREGADO },
        fecha_entrega_esperada: { $lt: hoy }
    })
        .populate('actor')
        .sort({ fecha_entrega_esperada: 1 })
}

export default { obtenerDemandaConsolidada, obtenerRetrasosEntregas }
