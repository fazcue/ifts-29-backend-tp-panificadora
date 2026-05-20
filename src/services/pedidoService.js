import Pedido from "../models/Pedido.js"
import mongoose from "mongoose"

const esIdValido = (id) => mongoose.isValidObjectId(id)

const ESTADOS = [ "PENDIENTE", "EN_PRODUCCION", "DESPACHADO", "ENTREGADO" ]

const obtenerPedidos = async () => {
    return await Pedido.find()
}

const buscarPedidoPorId = async (id) => {
    if (!esIdValido(id)) {
        return null
    }

    return await Pedido.findById(id)
}

const obtenerEstados = () => {
    return ESTADOS
}

const obtenerPedidosConActores = async () => {
    return await Pedido.find().populate('actor')
}

const crearPedido = async (fechaEntregaEsperada, idActor) => {
    const nuevo = new Pedido({
        fecha_entrega_esperada: fechaEntregaEsperada,
        actor: idActor
    })

    await nuevo.save()

    return nuevo
}

const actualizarPedido = async (id, fechaEntregaEsperada, fechaEntregaReal, estado, idActor) => {
    if (!esIdValido(id)) {
        return null
    }

    const datosActualizados = {
        fecha_entrega_esperada: fechaEntregaEsperada,
        fecha_entrega_real: fechaEntregaReal?.trim() || null,
        estado: estado?.trim(),
        actor: idActor
    }

    return await Pedido.findByIdAndUpdate(
        id,
        datosActualizados,
        { returnDocument: 'after', runValidators: true }
    )
}

const eliminarPedido = async (id) => {
    if (!esIdValido(id)) {
        return null
    }

    return await Pedido.findByIdAndDelete(id)
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
