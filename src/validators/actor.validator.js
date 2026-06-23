import actorService from '../services/actor.service.js'
import { obtenerTiposActor } from '../lib/tiposActor.js'
import { errorValidacion, exitoValidacion } from './response.validator.js'
import { validarTextoObligatorio, validarNombreUnico as nombreUnico } from './common.validator.js'

const validarActor = async (id) => {
    const actor = await actorService.buscarActorPorId(id)

    if (!actor) {
        return errorValidacion('Actor no encontrado', 404)
    }

    return exitoValidacion(actor)
}

const validarNombre = (nombre) => validarTextoObligatorio(nombre, 'nombre')

const validarNombreUnico = async (nombre, idActual = null) => {
    return await nombreUnico(nombre, idActual, actorService.obtenerActores, 'actor')
}

const validarEmail = (email) => {
    const resultado = validarTextoObligatorio(email, 'email')

    if (!resultado.ok) {
        return resultado
    }

    const emailLimpio = resultado.valor.toLowerCase()
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
    const resultado = validarTextoObligatorio(tipo, 'tipo')

    if (!resultado.ok) {
        return resultado
    }

    const tipoLimpio = resultado.valor.toUpperCase()
    const tipos = obtenerTiposActor()

    if (!tipos.includes(tipoLimpio)) {
        return errorValidacion(`Tipo inválido. Opciones: ${tipos.join(', ')}`)
    }

    return exitoValidacion(tipoLimpio)
}

const validarPassword = (password) => validarTextoObligatorio(password, 'contraseña')

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
