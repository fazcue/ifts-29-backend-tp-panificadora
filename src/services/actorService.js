import Actor from "../models/Actor.js"
import mongoose from "mongoose"

const TIPOS = ['PLANTA', 'SUCURSAL', 'FRANQUICIA']

const esIdValido = (id) => mongoose.isValidObjectId(id)

const obtenerActores = async () => {
    return await Actor.find()
}

const buscarActorPorId = async (id) => {
    if (!esIdValido(id)) {
        return null
    }

    return await Actor.findById(id)
}

const obtenerActoresActivos = async () => {
    return await Actor.find({ activo: true })
}

const obtenerTipos = async () => {
    return TIPOS
}

const crearActor = async (nombre, email, tipo) => {
    const nuevo = new Actor({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        tipo: tipo.trim()
    })
    await nuevo.save()

    return nuevo
}

const actualizarActor = async (id, nombre, email, tipo, activo) => {
    if (!esIdValido(id)) {
        return null
    }

    const datosActualizados = {
        nombre: nombre?.trim(),
        email: email?.trim().toLowerCase(),
        tipo: tipo?.trim()
    }

    if (activo !== undefined) {
        datosActualizados.activo = activo
    }

    return await Actor.findByIdAndUpdate(
        id,
        datosActualizados,
        { returnDocument: 'after', runValidators: true }
    )
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

    return await Actor.findByIdAndDelete(id)
}

export default {
    obtenerActores,
    buscarActorPorId,
    obtenerActoresActivos,
    obtenerTipos,
    crearActor,
    actualizarActor,
    cambiarEstadoActor,
    eliminarActor
}
