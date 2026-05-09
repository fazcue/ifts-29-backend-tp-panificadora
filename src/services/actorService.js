import { leerData, guardarData } from "../lib/fs.js"
import Actor from "../models/Actor.js"

const COLECCION = 'actores'
const TIPOS = "actor_tipo"

const obtenerActores = async () => {
    return await leerData(COLECCION)
}

const buscarActorPorId = async (id) => {
    const actores = await obtenerActores()
    return actores.find(actor => actor.id === +id)
}

const obtenerTipos = async () => {
    return await leerData(TIPOS)
}

const crearActor = async (nombre, tipo) => {
    const actores = await obtenerActores()
    const nuevo = new Actor(nombre.trim(), tipo.trim())

    await guardarData(COLECCION, [...actores, nuevo])

    return nuevo
}

const actualizarActor = async (id, nombre, tipo, activo) => {
    const actores = await obtenerActores()
    const actor = actores.find(actor => actor.id === +id)

    if (!actor) {
        return null
    }

    actor.nombre = nombre.trim()
    actor.tipo = tipo.trim()
    actor.activo = activo ?? actor.activo

    await guardarData(COLECCION, actores)

    return actor
}

const cambiarEstadoActor = async (id) => {
    const actores = await obtenerActores()
    const actor = actores.find(actor => actor.id === +id)

    if (!actor) {
        return null
    }

    actor.activo = !actor.activo

    await guardarData(COLECCION, actores)

    return actor
}

const eliminarActor = async (id) => {
    const actor = await buscarActorPorId(id)
    
    if (!actor) {
        return null
    }
    
    const actores = await obtenerActores()
    const filtrado = actores.filter(actor => actor.id !== +id)
    await guardarData(COLECCION, filtrado)

    return actor
}

export default {
    obtenerActores,
    buscarActorPorId,
    obtenerTipos,
    crearActor,
    actualizarActor,
    cambiarEstadoActor,
    eliminarActor
}
