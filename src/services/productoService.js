import mongoose from "mongoose"
import Producto from "../models/Producto.js"

const esIdValido = (id) => mongoose.isValidObjectId(id)

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
