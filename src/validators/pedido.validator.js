import { fechaValida } from "../lib/utils.js"
import actorService from "../services/actorService.js"
import pedidoService from "../services/pedidoService.js"
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

const validarPedido = async (id) => {
    const pedido = await pedidoService.buscarPedidoPorId(id)

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

    const estados = await pedidoService.obtenerEstados()

    // inválido
    if (!estados.includes(estadoLimpio)) {
        return responseValidator.errorValidacion(`Estado inválido. Opciones: ${estados.join(", ")}`)
    }

    return responseValidator.exito(estadoLimpio)
}

export default {
    validarFechaEntregaEsperada,
    validarActor,
    validarFechaEntregaReal,
    validarPedido,
    validarEstado
}
