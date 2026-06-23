import DetallePedido from '../models/DetallePedido.js'
import { esIdValido } from '../lib/utils.js'

const crearDetallesPedido = async (idPedido, productos) => {
    const detalles = productos.map((producto) => ({
        pedido: idPedido,
        producto: producto.id_producto,
        cantidad: producto.cantidad,
        precio_unitario: producto.precio_unitario,
    }))

    return await DetallePedido.insertMany(detalles, { ordered: true })
}

const eliminarDetallesPorPedido = async (idPedido) => {
    if (!esIdValido(idPedido)) {
        return null
    }

    return await DetallePedido.deleteMany({ pedido: idPedido })
}

export default {
    crearDetallesPedido,
    eliminarDetallesPorPedido,
}
