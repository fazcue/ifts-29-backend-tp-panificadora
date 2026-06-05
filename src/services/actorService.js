import Actor from "../models/Actor.js"
import Pedido from "../models/Pedido.js"
import { esIdValido, encriptarPassword } from "../lib/utils.js"

const TIPOS = ['PLANTA', 'SUCURSAL', 'FRANQUICIA']

const obtenerActores = async () => {
    return await Actor.find().select('-password')
}

const buscarActorPorId = async (id) => {
    if (!esIdValido(id)) {
        return null
    }

    return await Actor.findById(id).select('-password')
}

const buscarActorPorEmail = async (email) => {
    const emailNormalizado = email?.trim().toLowerCase()
    return await Actor.findOne({ email: emailNormalizado })
}

const obtenerActoresActivos = async () => {
    return await Actor.find({ activo: true }).select('-password')
}

const obtenerTipos = async () => {
    return TIPOS
}

const crearActor = async (nombre, email, password, tipo) => {
    const nuevo = new Actor({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password: encriptarPassword(password),
        tipo: tipo.trim()
    })
    await nuevo.save()

    return nuevo
}

const actualizarActor = async (id, nombre, email, password, tipo, activo) => {
    if (!esIdValido(id)) {
        return null
    }

    const datosActualizados = {
        nombre: nombre?.trim(),
        email: email?.trim().toLowerCase(),
        tipo: tipo?.trim()
    }

    const passwordNormalizado = password?.trim()

    if (passwordNormalizado) {
        datosActualizados.password = encriptarPassword(passwordNormalizado)
    }

    if (activo !== undefined) {
        datosActualizados.activo = activo
    }

    return await Actor.findByIdAndUpdate(
        id,
        datosActualizados,
        { returnDocument: 'after', runValidators: true }
    ).select('-password')
}

const cambiarEstadoActor = async (id) => {
    const actor = await buscarActorPorId(id)

    if (!actor) {
        return null
    }

    actor.activo = !actor.activo
    await actor.save()

    return actor
}

const eliminarActor = async (id) => {
    if (!esIdValido(id)) {
        return null
    }

    const actor = await Actor.findById(id).select('-password')

    if (!actor) {
        return null
    }

    const usadoEnPedido = await Pedido.exists({ actor: id })

    if (usadoEnPedido) {
        const error = new Error("No se puede eliminar un actor asociado a pedidos")
        error.estado = 409
        
        throw error
    }

    return await Actor.findByIdAndDelete(id)
}

export default {
    obtenerActores,
    buscarActorPorId,
    buscarActorPorEmail,
    obtenerActoresActivos,
    obtenerTipos,
    crearActor,
    actualizarActor,
    cambiarEstadoActor,
    eliminarActor
}
