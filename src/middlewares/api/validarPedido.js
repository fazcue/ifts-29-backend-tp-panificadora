import responseValidator from "../../validators/response.validator.js"
import pedidoValidator from "../../validators/pedido.validator.js"
import { esPlanta } from "../../lib/tiposActor.js"

const productosExistentesPedido = (pedido) => {
    return (pedido.productos || [])
        .filter((detalle) => detalle.producto)
        .map((detalle) => ({
            id_producto: detalle.producto._id || detalle.producto,
            precio_unitario: detalle.precio_unitario
        }))
}

const validarCrearPedido = async (req, res, next) => {
    try {
        const { fecha_entrega_esperada, productos } = req.body
        let id_actor = req.body.id_actor

        // fecha entrega esperada
        const resultadoFechaEsperada = pedidoValidator.validarFechaEntregaEsperada(fecha_entrega_esperada)

        if (!resultadoFechaEsperada.ok) {
            return responseValidator.respuestaError(res, resultadoFechaEsperada)
        }

        // id actor (si no es PLANTA, debe ser igual a user.id)
        if (!esPlanta(req.session.user)) {
            id_actor = req.session.user.id
        }

        // actor
        const resultadoActor = await pedidoValidator.validarActor(id_actor)

        if (!resultadoActor.ok) {
            return responseValidator.respuestaError(res, resultadoActor)
        }

        // productos
        const resultadoProductos = await pedidoValidator.validarProductos(productos)

        if (!resultadoProductos.ok) {
            return responseValidator.respuestaError(res, resultadoProductos)
        }

        // entrega de datos normalizados
        req.body.fecha_entrega_esperada = resultadoFechaEsperada.valor
        req.body.id_actor = resultadoActor.valor.id
        req.body.productos = resultadoProductos.valor

        next()
    } catch (err) {
        return res.status(500).json({ error: "Error validando pedido" })
    }
}

const validarActualizarPedido = async (req, res, next) => {
    try {
        let { fecha_entrega_esperada, fecha_entrega_real, estado, id_actor, productos } = req.body
        const { id } = req.params

        // pedido
        const resultadoPedido = await pedidoValidator.validarPedido(id, true)

        if (!resultadoPedido.ok) {
            return responseValidator.respuestaError(res, resultadoPedido)
        }

        // si no es planta, mantener valores de atributos no editables
        if (!esPlanta(req.session.user)) {
            estado = resultadoPedido.valor.estado
            id_actor = resultadoPedido.valor.actor.id
            fecha_entrega_real = resultadoPedido.valor.fecha_entrega_real
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
        const idActorPedido = resultadoPedido.valor.actor?._id || resultadoPedido.valor.actor
        const validarActivo = idActorPedido?.toString() !== id_actor
        const resultadoActor = await pedidoValidator.validarActor(id_actor, validarActivo)

        if (!resultadoActor.ok) {
            return responseValidator.respuestaError(res, resultadoActor)
        }

        // estado
        const resultadoEstado = await pedidoValidator.validarEstado(estado)

        if (!resultadoEstado.ok) {
            return responseValidator.respuestaError(res, resultadoEstado)
        }

        // productos
        const resultadoProductos = await pedidoValidator.validarProductos(productos, productosExistentesPedido(resultadoPedido.valor))

        if (!resultadoProductos.ok) {
            return responseValidator.respuestaError(res, resultadoProductos)
        }

        // entrega de datos normalizados
        req.body.fecha_entrega_esperada = resultadoFechaEsperada.valor
        req.body.fecha_entrega_real = resultadoFechaReal.valor
        req.body.estado = resultadoEstado.valor
        req.body.id_actor = resultadoActor.valor.id
        req.body.productos = resultadoProductos.valor

        next()
    } catch (err) {
        return res.status(500).json({ error: "Error validando pedido" })
    }
}

export { validarCrearPedido, validarActualizarPedido }
