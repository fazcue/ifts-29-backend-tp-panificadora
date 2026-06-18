import insumoService from '../services/insumoService.js'
import { obtenerUnidades, esUnidadValida } from '../lib/unidades.js'
import responseValidator from './response.validator.js'

const validarInsumo = async (id) => {
    const insumo = await insumoService.buscarInsumoPorId(id)

    if (!insumo) {
        return responseValidator.errorValidacion('Insumo no encontrado', 404)
    }

    return responseValidator.exito(insumo)
}

const validarNombre = (nombre) => {
    if (typeof nombre !== 'string') {
        return responseValidator.errorValidacion('El nombre debe ser texto')
    }

    const nombreLimpio = nombre.trim()

    if (!nombreLimpio) {
        return responseValidator.errorValidacion('El nombre es obligatorio')
    }

    return responseValidator.exito(nombreLimpio)
}

const validarNombreUnico = async (nombre, idActual = null) => {
    const insumos = await insumoService.obtenerInsumos()
    const nombreNormalizado = nombre.trim().toLowerCase()

    const existeInsumo = insumos.some((insumo) => {
        return insumo.id !== idActual && insumo.nombre.trim().toLowerCase() === nombreNormalizado
    })

    if (existeInsumo) {
        return responseValidator.errorValidacion(`Ya existe un insumo con el nombre ${nombre}`, 409)
    }

    return responseValidator.exito(nombre)
}

const validarUnidad = (unidad) => {
    if (typeof unidad !== 'string') {
        return responseValidator.errorValidacion('La unidad debe ser texto')
    }

    const unidadLimpia = unidad.trim().toLowerCase()

    if (!unidadLimpia) {
        return responseValidator.errorValidacion('La unidad es obligatoria')
    }

    if (!esUnidadValida(unidadLimpia)) {
        return responseValidator.errorValidacion(
            `La unidad debe ser una de: ${obtenerUnidades().join(', ')}`,
        )
    }

    return responseValidator.exito(unidadLimpia)
}

const validarBalance = (balance) => {
    if (balance === undefined || balance === null || balance === '') {
        return responseValidator.errorValidacion('El balance es obligatorio')
    }

    if (typeof balance === 'boolean') {
        return responseValidator.errorValidacion('El balance debe ser numérico')
    }

    const balanceNumerico = Number(balance)

    if (Number.isNaN(balanceNumerico)) {
        return responseValidator.errorValidacion('El balance debe ser numérico')
    }

    if (!Number.isInteger(balanceNumerico)) {
        return responseValidator.errorValidacion('El balance debe ser un número entero')
    }

    if (balanceNumerico < 0) {
        return responseValidator.errorValidacion('El balance no puede ser negativo')
    }

    return responseValidator.exito(balanceNumerico)
}

export default {
    validarInsumo,
    validarNombre,
    validarNombreUnico,
    validarUnidad,
    validarBalance,
}
