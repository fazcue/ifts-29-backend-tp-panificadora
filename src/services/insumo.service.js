import Insumo from '../models/Insumo.js'
import Receta from '../models/Receta.js'
import { esIdValido } from '../lib/utils.js'

const obtenerInsumos = async () => {
    return await Insumo.find()
}

const buscarInsumoPorId = async (id) => {
    if (!esIdValido(id)) {
        return null
    }

    return await Insumo.findById(id)
}

const obtenerInsumosActivos = async () => {
    return await Insumo.find({ activo: true })
}

const crearInsumo = async (nombre, unidad, balance) => {
    const nuevo = new Insumo({
        nombre: nombre.trim(),
        unidad: unidad.trim().toLowerCase(),
        balance,
    })

    await nuevo.save()

    return nuevo
}

const actualizarInsumo = async (id, nombre, unidad, balance) => {
    if (!esIdValido(id)) {
        return null
    }

    const datosActualizados = {
        nombre: nombre.trim(),
        unidad: unidad.trim().toLowerCase(),
        balance,
    }

    return await Insumo.findByIdAndUpdate(
        id,
        datosActualizados,
        { returnDocument: 'after', runValidators: true },
    )
}

const cambiarEstadoInsumo = async (id) => {
    const insumo = await buscarInsumoPorId(id)

    if (!insumo) {
        return null
    }

    insumo.activo = !insumo.activo
    await insumo.save()

    return insumo
}

const eliminarInsumo = async (id) => {
    if (!esIdValido(id)) {
        return null
    }

    const insumo = await Insumo.findById(id)

    if (!insumo) {
        return null
    }

    const usadoEnReceta = await Receta.exists({ insumo: id })

	if (usadoEnReceta) {
		const error = new Error('No se puede eliminar un insumo asociado a productos')
		error.estado = 409
		throw error
	}

    return await Insumo.findByIdAndDelete(id)
}

export default {
    obtenerInsumos,
    buscarInsumoPorId,
    obtenerInsumosActivos,
    crearInsumo,
    actualizarInsumo,
    cambiarEstadoInsumo,
    eliminarInsumo,
}
