import actorService from '../services/actor.service.js'
import { obtenerTiposActor } from '../lib/tiposActor.js'
import { errorValidacion, exitoValidacion } from './response.validator.js'

const validarActor = async (id) => {
    const actor = await actorService.buscarActorPorId(id)

    if (!actor) {
        return errorValidacion('Actor no encontrado', 404)
    }

    return exitoValidacion(actor)
}

const validarNombre = (nombre) => {
    if (typeof nombre !== 'string') {
        return errorValidacion('El nombre debe ser texto')
    }

    const nombreLimpio = nombre.trim()

    if (!nombreLimpio) {
        return errorValidacion('El nombre es obligatorio')
    }

    return exitoValidacion(nombreLimpio)
}

const validarNombreUnico = async (nombre, idActual = null) => {
    const actores = await actorService.obtenerActores()
    const nombreNormalizado = nombre.trim().toLowerCase()

    const existeActor = actores.some((actor) => {
        return actor.id !== idActual && actor.nombre.trim().toLowerCase() === nombreNormalizado
    })

    if (existeActor) {
        return errorValidacion(`Ya existe un actor con el nombre ${nombre}`, 409)
    }

    return exitoValidacion(nombre)
}

const validarEmail = (email) => {
    if (typeof email !== 'string') {
        return errorValidacion('El email debe ser texto')
    }

    const emailLimpio = email.trim().toLowerCase()

    if (!emailLimpio) {
        return errorValidacion('El email es obligatorio')
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)

    if (!emailValido) {
        return errorValidacion('Email inválido')
    }

    return exitoValidacion(emailLimpio)
}

const validarEmailUnico = async (email, idActual = null) => {
    const actores = await actorService.obtenerActores()
    const emailNormalizado = email.trim().toLowerCase()

    const existeEmail = actores.some((actor) => {
        return actor.id !== idActual && actor.email?.trim().toLowerCase() === emailNormalizado
    })

    if (existeEmail) {
        return errorValidacion(`Ya existe un actor con el email ${email}`, 409)
    }

    return exitoValidacion(email)
}

const validarTipo = (tipo) => {
    if (typeof tipo !== 'string') {
        return errorValidacion('El tipo debe ser texto')
    }

    const tipoLimpio = tipo.trim().toUpperCase()

    if (!tipoLimpio) {
        return errorValidacion('El tipo es obligatorio')
    }

    const tipos = obtenerTiposActor()

    if (!tipos.includes(tipoLimpio)) {
        return errorValidacion(`Tipo inválido. Opciones: ${tipos.join(', ')}`)
    }

    return exitoValidacion(tipoLimpio)
}

const validarPassword = (password) => {
    if (password === undefined || password === null || password === '') {
        return errorValidacion('La contraseña es obligatoria')
    }

    if (typeof password !== 'string') {
        return errorValidacion('La contraseña debe ser texto')
    }

    const passwordLimpio = password.trim()

    if (!passwordLimpio) {
        return errorValidacion('La contraseña es obligatoria')
    }

    return exitoValidacion(passwordLimpio)
}

const validarActivo = (activo) => {
    if (activo === undefined) {
        return exitoValidacion()
    }

    if (typeof activo !== 'boolean') {
        return errorValidacion('El campo activo debe ser booleano')
    }

    return exitoValidacion(activo)
}

export default {
    validarActor,
    validarNombre,
    validarNombreUnico,
    validarEmail,
    validarEmailUnico,
    validarTipo,
    validarPassword,
    validarActivo,
}
