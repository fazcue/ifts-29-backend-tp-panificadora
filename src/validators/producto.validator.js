import productoService from "../services/productoService.js"
import responseValidator from "./response.validator.js"

const validarProducto = async (id) => {
    const producto = await productoService.buscarProductoPorId(id)

    // inexistente
    if (!producto) {
        return responseValidator.errorValidacion("Producto no encontrado", 404)
    }

    return responseValidator.exito(producto)
}

const validarNombre = (nombre) => {
    // tipo inválido
    if (typeof nombre !== "string") {
        return responseValidator.errorValidacion("El nombre debe ser texto")
    }

    // normalizar
    const nombreLimpio = nombre.trim()

    // dato faltante
    if (!nombreLimpio) {
        return responseValidator.errorValidacion("El nombre es obligatorio")
    }

    return responseValidator.exito(nombreLimpio)
}

const validarNombreUnico = async (nombre, idActual = null) => {
    const productos = await productoService.obtenerProductos()

    // normalizar
    const nombreNormalizado = nombre.trim().toLowerCase()

    const existeProducto = productos.some(producto => {
        return producto.id !== idActual && producto.nombre.trim().toLowerCase() === nombreNormalizado
    })

    // duplicado
    if (existeProducto) {
        return responseValidator.errorValidacion(`Ya existe un producto con el nombre ${nombre}`, 409)
    }

    return responseValidator.exito(nombre)
}

const validarPrecio = (precio) => {
    // dato faltante
    if (precio === undefined || precio === null || precio === "") {
        return responseValidator.errorValidacion("El precio es obligatorio")
    }

    // tipo booleano (evitar true -> 1, false -> 0)
    if (typeof precio === "boolean") {
        return responseValidator.errorValidacion("El precio debe ser numérico")
    }

    const precioNumerico = Number(precio)

    // tipo inválido
    if (Number.isNaN(precioNumerico)) {
        return responseValidator.errorValidacion("El precio debe ser numérico")
    }

    // menor o igual a cero
    if (precioNumerico <= 0) {
        return responseValidator.errorValidacion("El precio debe ser mayor a cero")
    }

    return responseValidator.exito(precioNumerico)
}

const validarActivo = (activo) => {
    if (activo === undefined) {
        return responseValidator.exito()
    }

    // tipo inválido
    if (typeof activo !== "boolean") {
        return responseValidator.errorValidacion("El campo activo debe ser booleano")
    }

    return responseValidator.exito(activo)
}

export default {
    validarProducto,
    validarNombre,
    validarNombreUnico,
    validarPrecio,
    validarActivo,
}
