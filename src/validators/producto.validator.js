import productoService from '../services/producto.service.js'
import { errorValidacion, exitoValidacion } from './response.validator.js'
import { validarTextoObligatorio, validarNombreUnico as nombreUnico } from './common.validator.js'

const validarProducto = async (id) => {
    const producto = await productoService.buscarProductoPorId(id)

    // inexistente
    if (!producto) {
        return errorValidacion('Producto no encontrado', 404)
    }

    return exitoValidacion(producto)
}

const validarNombre = (nombre) => validarTextoObligatorio(nombre, 'nombre')

const validarNombreUnico = async (nombre, idActual = null) => {
    return await nombreUnico(nombre, idActual, productoService.obtenerProductos, 'producto')
}

const validarPrecio = (precio) => {
    // dato faltante
    if (precio === undefined || precio === null || precio === '') {
        return errorValidacion('El precio es obligatorio')
    }

    // tipo booleano
    if (typeof precio === 'boolean') {
        return errorValidacion('El precio debe ser numérico')
    }

    const precioNumerico = Number(precio)

    // tipo inválido
    if (Number.isNaN(precioNumerico)) {
        return errorValidacion('El precio debe ser numérico')
    }

    // menor o igual a cero
    if (precioNumerico <= 0) {
        return errorValidacion('El precio debe ser mayor a cero')
    }

    return exitoValidacion(precioNumerico)
}

const validarActivo = (activo) => {
    if (activo === undefined) {
        return exitoValidacion()
    }

    // tipo inválido
    if (typeof activo !== 'boolean') {
        return errorValidacion('El campo activo debe ser booleano')
    }

    return exitoValidacion(activo)
}

export default {
    validarProducto,
    validarNombre,
    validarNombreUnico,
    validarPrecio,
    validarActivo,
}
