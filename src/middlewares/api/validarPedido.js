import responseValidator from "../../validators/response.validator.js"
import pedidoValidator from "../../validators/pedido.validator.js"

// pedido nuevo:
/*
    fecha_entrega_esperada es obligatoria.
        Debe ser texto.
        Debe tener formato AAAA-MM-DD.
    id_actor es obligatorio.
        El actor debe existir.
        El actor debe estar activo.
*/
async function validarCrearPedido(req, res, next) {
    try {
        const { fecha_entrega_esperada, id_actor } = req.body

        // fecha entrega esperada
        const resultadoFechaEsperada = pedidoValidator.validarFechaEntregaEsperada(fecha_entrega_esperada)

        if (!resultadoFechaEsperada.ok) {
            return responseValidator.respuestaError(res, resultadoFechaEsperada)
        }

        // actor
        const resultadoActor = await pedidoValidator.validarActor(id_actor)

        if (!resultadoActor.ok) {
            return responseValidator.respuestaError(res, resultadoActor)
        }

        // entrega de datos normalizados
        req.body.fecha_entrega_esperada = resultadoFechaEsperada.valor
        req.body.id_actor = resultadoActor.valor.id

        next()
    } catch (err) {
        return res.status(500).json({ error: "Error validando pedido" })
    }
}

// actualizar pedido:
/*
    El pedido debe existir.
    fecha_entrega_esperada es obligatoria.
    estado es obligatorio.
    id_actor es obligatorio.
    fecha_entrega_real es opcional, pero si se envía debe tener formato AAAA-MM-DD.
    estado debe ser uno de: PENDIENTE / EN_PRODUCCION / DESPACHADO / ENTREGADO
*/
async function validarActualizarPedido(req, res, next) {
    try {
        const { fecha_entrega_esperada, fecha_entrega_real, estado, id_actor } = req.body
        const { id } = req.params

        // pedido
        const resultadoPedido = await pedidoValidator.validarPedido(id)

        if (!resultadoPedido.ok) {
            return responseValidator.respuestaError(res, resultadoPedido)
        }

        // fecha entrega esperada
        const resultadoFechaEsperada = pedidoValidator.validarFechaEntregaEsperada(fecha_entrega_esperada)

        if (!resultadoFechaEsperada.ok) {
            return responseValidator.respuestaError(res, resultadoFechaEsperada)
        }

        // fecha entrega real
        const resultadoFechaReal = pedidoValidator.validarFechaEntregaReal(fecha_entrega_real)

        if (!resultadoFechaReal.ok) {
            return responseValidator.respuestaError(res, resultadoFechaReal)
        }

        // actor
        const resultadoActor = await pedidoValidator.validarActor(id_actor)

        if (!resultadoActor.ok) {
            return responseValidator.respuestaError(res, resultadoActor)
        }

        // estado
        const resultadoEstado = await pedidoValidator.validarEstado(estado)

        if (!resultadoEstado.ok) {
            return responseValidator.respuestaError(res, resultadoEstado)
        }

        // entrega de datos normalizados
        req.body.fecha_entrega_esperada = resultadoFechaEsperada.valor
        req.body.fecha_entrega_real = resultadoFechaReal.valor
        req.body.estado = resultadoEstado.valor
        req.body.id_actor = resultadoActor.valor.id

        next()
    } catch (err) {
        return res.status(500).json({ error: "Error validando pedido" })
    }
}

export { validarCrearPedido, validarActualizarPedido }
