import insumoService from '../services/insumo.service.js'
import { obtenerUnidades, esUnidadValida } from '../lib/unidades.js'
import { errorValidacion, exitoValidacion } from './response.validator.js'
import { validarTextoObligatorio, validarNombreUnico as nombreUnico } from './common.validator.js'

const validarInsumo = async (id) => {
    const insumo = await insumoService.buscarInsumoPorId(id)

    if (!insumo) {
        return errorValidacion('Insumo no encontrado', 404)
    }

    return exitoValidacion(insumo)
}

const validarNombre = (nombre) => validarTextoObligatorio(nombre, 'nombre')

const validarNombreUnico = async (nombre, idActual = null) => {
    return await nombreUnico(nombre, idActual, insumoService.obtenerInsumos, 'insumo')
}

const validarUnidad = (unidad) => {
    const resultado = validarTextoObligatorio(unidad, 'unidad')

    if (!resultado.ok) {
        return resultado
    }

    const unidadLimpia = resultado.valor.toLowerCase()

    if (!esUnidadValida(unidadLimpia)) {
        return errorValidacion(
            `La unidad debe ser una de: ${obtenerUnidades().join(', ')}`,
        )
    }

    return exitoValidacion(unidadLimpia)
}

const validarBalance = (balance) => {
    if (balance === undefined || balance === null || balance === '') {
        return errorValidacion('El balance es obligatorio')
    }

    if (typeof balance === 'boolean') {
        return errorValidacion('El balance debe ser numérico')
    }

    const balanceNumerico = Number(balance)

    if (Number.isNaN(balanceNumerico)) {
        return errorValidacion('El balance debe ser numérico')
    }

    if (!Number.isInteger(balanceNumerico)) {
        return errorValidacion('El balance debe ser un número entero')
    }

    if (balanceNumerico < 0) {
        return errorValidacion('El balance no puede ser negativo')
    }

    return exitoValidacion(balanceNumerico)
}

export default {
    validarInsumo,
    validarNombre,
    validarNombreUnico,
    validarUnidad,
    validarBalance,
}
