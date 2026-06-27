import Actor from '../models/Actor.js'
import Pedido from '../models/Pedido.js'
import { TIPOS_ACTOR, esPlanta } from '../lib/tiposActor.js'
import { esIdValido, encriptarPassword } from '../lib/utils.js'

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

const obtenerActoresPorTipo = async (tipo) => {
    return await Actor.find({ tipo, activo: true }).select('-password')
}

const obtenerActoresActivos = async () => {
    return await Actor.find({ activo: true }).select('-password')
}

const existeActorPlanta = async () => {
    return Boolean(await Actor.exists({ tipo: TIPOS_ACTOR.PLANTA }))
}

const validarUnicidadPlanta = async (idActual = null) => {
    const plantaExistente = await Actor.findOne({ tipo: TIPOS_ACTOR.PLANTA }).select('_id')

    if (plantaExistente && String(plantaExistente._id) !== String(idActual)) {
        const error = new Error('Ya existe un actor de tipo PLANTA')
        error.estado = 409

        throw error
    }
}

const crearActor = async (nombre, email, password, tipo) => {
    const tipoNormalizado = tipo.trim().toUpperCase()

    if (tipoNormalizado === TIPOS_ACTOR.PLANTA) {
        await validarUnicidadPlanta()
    }

    const nuevo = new Actor({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password: encriptarPassword(password),
        tipo: tipoNormalizado,
        activo: tipoNormalizado === TIPOS_ACTOR.PLANTA
    })

    await nuevo.save()

    return await Actor.findById(nuevo._id).select('-password')
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
        tipo: tipo?.trim().toUpperCase()
    }

    if (esPlanta(actor) && datosNormalizados.tipo !== TIPOS_ACTOR.PLANTA) {
        const error = new Error('No se puede editar el tipo del actor PLANTA')
        error.estado = 409

        throw error
    }

    if (!esPlanta(actor) && datosNormalizados.tipo === TIPOS_ACTOR.PLANTA) {
        await validarUnicidadPlanta(id)
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
        const error = new Error('No se puede desactivar al actor PLANTA')
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
        const error = new Error('No se puede eliminar un actor asociado a pedidos')
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
    obtenerActoresPorTipo,
    existeActorPlanta,
    crearActor,
    actualizarActor,
    cambiarEstadoActor,
    eliminarActor
}
