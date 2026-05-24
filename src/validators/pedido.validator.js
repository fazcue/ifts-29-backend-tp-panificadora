import { fechaValida } from "../lib/utils.js"
import actorService from "../services/actorService.js"
import pedidoService from "../services/pedidoService.js"
import productoService from "../services/productoService.js"
import responseValidator from "./response.validator.js"

const validarFechaEntregaEsperada = (fecha) => {
    // tipo inválido
    if (typeof fecha !== "string") {
        return responseValidator.errorValidacion("La fecha de entrega esperada debe ser texto")
    }

    // normalizar
    const fechaLimpia = fecha.trim()

    // dato faltante
    if (!fechaLimpia) {
        return responseValidator.errorValidacion("La fecha de entrega esperada es obligatoria")
    }

    // formato inválido
    if (!fechaValida(fechaLimpia)) {
        return responseValidator.errorValidacion("Fecha de entrega esperada inválida")
    }

    return responseValidator.exito(fechaLimpia)
}

const validarActor = async (id, validarActivo = true) => {
    // dato faltante
    if (id === undefined || id === null || id === "") {
        return responseValidator.errorValidacion("El actor es obligatorio")
    }

    const actor = await actorService.buscarActorPorId(id)

    // inexistente
    if (!actor) {
        return responseValidator.errorValidacion("Actor inexistente")
    }

    // inactivo
    if (validarActivo && !actor.activo) {
        return responseValidator.errorValidacion("El actor debe estar activo para realizar pedidos")
    }

    return responseValidator.exito(actor)
}

const validarFechaEntregaReal = (fecha) => {
    // dato faltante (exitoso al crear pedido)
    if (fecha === undefined || fecha === null || fecha === "") {
        return responseValidator.exito()
    }

    // tipo inv{alido}
    if (typeof fecha !== "string") {
        return responseValidator.errorValidacion("La fecha de entrega real debe ser texto")
    }

    // normalizar
    const fechaLimpia = fecha.trim()

    // dato faltante (exitoso al crear pedido)
    if (!fechaLimpia) {
        return responseValidator.exito(null)
    }

    // formato inválido
    if (!fechaValida(fechaLimpia)) {
        return responseValidator.errorValidacion("Fecha de entrega real inválida")
    }

    return responseValidator.exito(fechaLimpia)
}

const validarPedido = async (id, incluirDetalles = false) => {
    const pedido = incluirDetalles
        ? await pedidoService.buscarPedidoPorIdConDetalles(id)
        : await pedidoService.buscarPedidoPorId(id)

    // inexistente
    if (!pedido) {
        return responseValidator.errorValidacion("Pedido no encontrado", 404)
    }

    return responseValidator.exito(pedido)
}

const validarEstado = async (estado) => {
    // dato faltante
    if (estado === undefined || estado === null || estado === "") {
        return responseValidator.errorValidacion("El estado es obligatorio")
    }

    // tipo inválido
    if (typeof estado !== "string") {
        return responseValidator.errorValidacion("El estado debe ser texto")
    }

    // normalizar
    const estadoLimpio = estado.trim()

    // dato faltante
    if (!estadoLimpio) {
        return responseValidator.errorValidacion("El estado es obligatorio")
    }

    const estados = pedidoService.obtenerEstados()

    // inválido
    if (!estados.includes(estadoLimpio)) {
        return responseValidator.errorValidacion(`Estado inválido. Opciones: ${estados.join(", ")}`)
    }

    return responseValidator.exito(estadoLimpio)
}

const obtenerPrecioUnitario = (productosExistentes = [], idProducto, precioProducto) => {
    const productoExistente = productosExistentes.find((item) => String(item.id_producto) === String(idProducto))

    return productoExistente?.precio_unitario ?? precioProducto
}

const validarProductos = async (productos, productosExistentes = []) => {
    // tipo inválido
    if (!Array.isArray(productos)) {
        return responseValidator.errorValidacion("Se debe añadir al menos un producto")
    }

    // normalizar: solo se procesan productos con cantidad indicada
    const productosSeleccionados = productos.filter(producto => {
        const cantidad = producto?.cantidad
        const cantidadTexto = String(cantidad ?? "").trim()

        return cantidadTexto !== "" && Number(cantidadTexto) !== 0
    })

    // Al menos un producto seleccionado
    if (productosSeleccionados.length === 0) {
        return responseValidator.errorValidacion("Se debe añadir al menos un producto")
    }

    // validación individual de productos
    const idsProductos = new Set()
    const productosNormalizados = []

    for (const item of productosSeleccionados) {
        const idProducto = item?.id_producto
        const cantidad = Number(item?.cantidad)

        // producto obligatorio
        if (!idProducto) {
            return responseValidator.errorValidacion("El id del producto es obligatorio")
        }

        // producto duplicado
        if (idsProductos.has(idProducto)) {
            return responseValidator.errorValidacion("No se puede repetir el mismo producto en un pedido")
        }

        idsProductos.add(idProducto)

        // cantidad inválida
        if (Number.isNaN(cantidad)) {
            return responseValidator.errorValidacion("La cantidad debe ser numérica")
        }

        if (!Number.isInteger(cantidad)) {
            return responseValidator.errorValidacion("La cantidad debe ser un numero entero")
        }

        if (cantidad <= 0) {
            return responseValidator.errorValidacion("La cantidad debe ser mayor a cero")
        }

        const producto = await productoService.buscarProductoPorId(idProducto)

        // producto inexistente
        if (!producto) {
            return responseValidator.errorValidacion(`Producto con id ${idProducto} inexistente`)
        }

        const productoExistente = productosExistentes.some((item) => String(item.id_producto) === String(producto.id))

        // producto inactivo
        if (!producto.activo && !productoExistente) {
            return responseValidator.errorValidacion(`Producto "${producto.nombre}" inactivo`)
        }

        productosNormalizados.push({
            id_producto: producto.id,
            cantidad,
            precio_unitario: obtenerPrecioUnitario(productosExistentes, producto.id, producto.precio),
        })
    }

    return responseValidator.exito(productosNormalizados)
}

export default {
    validarFechaEntregaEsperada,
    validarActor,
    validarFechaEntregaReal,
    validarPedido,
    validarEstado,
    validarProductos
}
