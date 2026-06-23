import Receta from '../models/Receta.js'
import { esIdValido } from '../lib/utils.js'

const crearReceta = async (idProducto, insumos) => {
    const entradas = insumos.map((insumo) => ({
        producto: idProducto,
        insumo: insumo.id_insumo,
        cantidad_necesaria: insumo.cantidad_necesaria,
    }))

    return await Receta.insertMany(entradas, { ordered: true })
}

const eliminarRecetasPorProducto = async (idProducto) => {
    if (!esIdValido(idProducto)) {
        return null
    }

    return await Receta.deleteMany({ producto: idProducto })
}

const obtenerInsumosPorProducto = async (idProducto) => {
    if (!esIdValido(idProducto)) {
        return []
    }

    return await Receta.find({ producto: idProducto }).populate('insumo')
}

export default {
    crearReceta,
    eliminarRecetasPorProducto,
    obtenerInsumosPorProducto,
}
