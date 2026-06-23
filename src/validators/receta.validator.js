import insumoService from '../services/insumo.service.js'
import { errorValidacion, exitoValidacion } from './response.validator.js'

const validarInsumos = async (insumos, insumosExistentes = []) => {
    // tipo inválido
    if (!Array.isArray(insumos)) {
        return errorValidacion('Se debe añadir al menos un insumo')
    }

    // normalizar: solo se procesan insumos con cantidad indicada
    const insumosSeleccionados = insumos.filter((item) => {
        const cantidad = item?.cantidad_necesaria
        const cantidadTexto = String(cantidad ?? '').trim()

        return cantidadTexto !== '' && Number(cantidadTexto) !== 0
    })

    // al menos un insumo seleccionado
    if (insumosSeleccionados.length === 0) {
        return errorValidacion('Se debe añadir al menos un insumo')
    }

    // validación individual de insumos
    const idsInsumos = new Set()
    const insumosNormalizados = []

    for (const item of insumosSeleccionados) {
        const idInsumo = item?.id_insumo
        const cantidad = Number(item?.cantidad_necesaria)

        // insumo obligatorio
        if (!idInsumo) {
            return errorValidacion('El id del insumo es obligatorio')
        }

        // insumo duplicado
        if (idsInsumos.has(idInsumo)) {
            return errorValidacion('No se puede repetir el mismo insumo en una receta')
        }

        idsInsumos.add(idInsumo)

        // cantidad inválida
        if (Number.isNaN(cantidad)) {
            return errorValidacion('La cantidad necesaria debe ser numérica')
        }

        if (cantidad <= 0) {
            return errorValidacion('La cantidad necesaria debe ser mayor a cero')
        }

        const insumo = await insumoService.buscarInsumoPorId(idInsumo)

        // insumo inexistente
        if (!insumo) {
            return errorValidacion(`Insumo con id ${idInsumo} inexistente`)
        }

        const existeEnReceta = insumosExistentes.some(
            (item) => String(item.insumo?._id || item.insumo) === String(insumo.id),
        )

        // insumo inactivo (solo se permite si ya estaba en la receta)
        if (!insumo.activo && !existeEnReceta) {
            return errorValidacion(`Insumo "${insumo.nombre}" inactivo`)
        }

        insumosNormalizados.push({
            id_insumo: insumo.id,
            cantidad_necesaria: cantidad,
        })
    }

    return exitoValidacion(insumosNormalizados)
}

export default {
    validarInsumos,
}
