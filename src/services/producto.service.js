import Producto from '../models/Producto.js'
import { esIdValido } from '../lib/utils.js'
import DetallePedido from '../models/DetallePedido.js'
import recetaService from './receta.service.js'

const obtenerProductos = async () => {
    return await Producto.find()
}

const buscarProductoPorId = async (id) => {
    if (!esIdValido(id)) {
        return null
    }

    return await Producto.findById(id)
}

const obtenerProductosActivos = async () => {
    return await Producto.find({ activo: true })
}

const crearProducto = async (nombre, precio, activo = false, insumos = []) => {
    let nuevo = null

    try {
        nuevo = new Producto({
            nombre: nombre.trim(),
            precio,
            activo,
        })

        await nuevo.save()

        // crear receta (insumos)
        if (insumos.length > 0) {
            await recetaService.crearReceta(nuevo.id, insumos)
        }

        return nuevo
    } catch (error) {
        // si falla la creación de la receta, eliminar datos huérfanos
        if (nuevo?.id) {
            await recetaService.eliminarRecetasPorProducto(nuevo.id)
            await Producto.findByIdAndDelete(nuevo.id)
        }

        throw error
    }
}

const actualizarProducto = async (id, nombre, precio, activo, insumos = null) => {
    if (!esIdValido(id)) {
        return null
    }

    const productoActual = await Producto.findById(id)

    if (!productoActual) {
        return null
    }

    const datosActualizados = {
        nombre: nombre.trim(),
        precio,
    }

    if (activo !== undefined) {
        datosActualizados.activo = activo
    }

    const producto = await Producto.findByIdAndUpdate(
        id,
        datosActualizados,
        { returnDocument: 'after', runValidators: true }
    )

    if (!producto) {
        return null
    }

    // actualizar receta si se enviaron insumos
    if (insumos) {
        await recetaService.eliminarRecetasPorProducto(id)
        if (insumos.length > 0) {
            await recetaService.crearReceta(id, insumos)
        }
    }

    return producto
}

const cambiarEstadoProducto = async (id) => {
    const producto = await buscarProductoPorId(id)

    if (!producto) {
        return null
    }

    producto.activo = !producto.activo
    await producto.save()

    return producto
}

const eliminarProducto = async (id) => {
    if (!esIdValido(id)) {
        return null
    }

    const producto = await Producto.findById(id)

    if (!producto) {
        return null
    }

    const usadoEnPedido = await DetallePedido.exists({ producto: id })

    if (usadoEnPedido) {
        const error = new Error('No se puede eliminar un producto asociado a pedidos')
        error.estado = 409

        throw error
    }

    // eliminar receta asociada
    await recetaService.eliminarRecetasPorProducto(id)

    return await Producto.findByIdAndDelete(id)
}

export default {
    obtenerProductos,
    buscarProductoPorId,
    obtenerProductosActivos,
    crearProducto,
    actualizarProducto,
    cambiarEstadoProducto,
    eliminarProducto,
}
