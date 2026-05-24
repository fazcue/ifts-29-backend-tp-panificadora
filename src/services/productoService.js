import Producto from "../models/Producto.js"
import { esIdValido } from "../lib/utils.js"
import DetallePedido from "../models/DetallePedido.js"

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

const crearProducto = async (nombre, precio, activo = false) => {
    const nuevo = new Producto({
        nombre: nombre.trim(),
        precio,
        activo,
    })

    await nuevo.save()

    return nuevo
}

const actualizarProducto = async (id, nombre, precio, activo) => {
    if (!esIdValido(id)) {
        return null
    }

    const datosActualizados = {
        nombre: nombre.trim(),
        precio,
    }

    if (activo !== undefined) {
        datosActualizados.activo = activo
    }

    return await Producto.findByIdAndUpdate(
        id,
        datosActualizados,
        { returnDocument: 'after', runValidators: true }
    )
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
        const error = new Error("No se puede eliminar un producto asociado a pedidos")
        error.estado = 409

        throw error
    }

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
