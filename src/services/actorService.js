import Actor from "../models/Actor.js"
import Pedido from "../models/Pedido.js"
import { ROLES, esPlanta } from "../lib/roles.js"
import { esIdValido, encriptarPassword } from "../lib/utils.js"

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

const obtenerTipos = () => {
    return Object.values(ROLES)
}

const crearActor = async (nombre, email, password, tipo) => {
    if (tipo === ROLES.PLANTA) {
        const error = new Error("No se puede crear un segundo actor de tipo PLANTA")
        error.estado = 409

        throw error
    }

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

    const actor = await buscarActorPorId(id)

    if (!actor) {
        return null
    }

    const datosNormalizados = {
        nombre: nombre?.trim(),
        email: email?.trim().toLowerCase(),
        tipo: tipo?.trim()
    }

    if (esPlanta(actor) && datosNormalizados.tipo !== ROLES.PLANTA) {
        const error = new Error("No se puede editar el tipo del actor PLANTA")
        error.estado = 409

        throw error
    }

    const passwordNormalizado = password?.trim()

    if (passwordNormalizado) {
        datosNormalizados.password = encriptarPassword(passwordNormalizado)
    }

    if (activo !== undefined) {
        datosNormalizados.activo = activo
    }

    return await Actor.findByIdAndUpdate(
        id,
        datosNormalizados,
        { returnDocument: 'after', runValidators: true }
    ).select('-password')
}

const cambiarEstadoActor = async (id) => {
    if (!esIdValido(id)) {
        return null
    }

    const actor = await buscarActorPorId(id)

    if (!actor) {
        return null
    }

    if (esPlanta(actor)) {
        const error = new Error("No se puede desactivar al actor PLANTA")
        error.estado = 409

        throw error
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
