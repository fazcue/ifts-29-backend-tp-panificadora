import responseValidator from "../../validators/response.validator.js"
import pedidoService from "../../services/pedidoService.js"
import actorService from "../../services/actorService.js"
import pedidoValidator from "../../validators/pedido.validator.js"

// vistas
const VISTA_CREAR_PEDIDO = 'pedidos/nuevo'
const VISTA_ACTUALIZAR_PEDIDO = 'pedidos/editar'

// datos de formulario al crear nuevo pedido
async function datosFormularioCrear(fecha_entrega_esperada, id_actor) {
    const actores = await actorService.obtenerActores()
    const estados = await pedidoService.obtenerEstados()

    const actoresActivos = actores.filter(actor => actor.activo)

    return {
        pedido: {
            fecha_entrega_esperada,
            id_actor: +id_actor
        },
        actores: actoresActivos,
        estados
    }
}

// datos de formulario al actualizar nuevo pedido
async function datosFormularioActualizar(id, fecha_entrega_esperada, fecha_entrega_real, estado, id_actor) {
    const actores = await actorService.obtenerActores()
    const estados = await pedidoService.obtenerEstados()

    const actoresActivos = actores.filter(actor => actor.activo)
    const pedidoActual = id ? await pedidoService.buscarPedidoPorId(+id) : null

    return {
        pedido: {
            ...pedidoActual,
            fecha_entrega_esperada,
            fecha_entrega_real,
            estado,
            id_actor: +id_actor
        },
        actores: actoresActivos,
        estados
    }
}

// pedido nuevo:
/*
    fecha_entrega_esperada es obligatoria.
        Debe ser texto.
        Debe tener formato AAAA-MM-DD.
    id_actor es obligatorio.
        El actor debe existir.
        El actor debe estar activo.
*/
async function validarCrearPedidoWeb(req, res, next) {
    try {
        const { fecha_entrega_esperada, id_actor } = req.body

        // datos formulario (necesario para el render)
        const datosFormulario = await datosFormularioCrear(fecha_entrega_esperada, id_actor)

        // fecha entrega esperada
        const resultadoFechaEsperada = pedidoValidator.validarFechaEntregaEsperada(fecha_entrega_esperada)

        if (!resultadoFechaEsperada.ok) {
            return responseValidator.respuestaErrorWeb(res, VISTA_CREAR_PEDIDO, resultadoFechaEsperada, datosFormulario)
        }

        // actor
        const resultadoActor = await pedidoValidator.validarActor(id_actor)

        if (!resultadoActor.ok) {
            return responseValidator.respuestaErrorWeb(res, VISTA_CREAR_PEDIDO, resultadoActor, datosFormulario)
        }

        // entrega de datos normalizados
        req.body.fecha_entrega_esperada = resultadoFechaEsperada.valor
        req.body.id_actor = resultadoActor.valor.id

        next()
    } catch (err) {
        return res.status(500).render('error', { mensaje: "Error validando pedido" })
    }
}

async function validarActualizarPedidoWeb(req, res, next) {
    try {
        const { fecha_entrega_esperada, fecha_entrega_real, estado, id_actor } = req.body
        const { id } = req.params

        // datos formulario (necesario para el render)
        const datosFormulario = await datosFormularioActualizar(id, fecha_entrega_esperada, fecha_entrega_real, estado, id_actor)

        // pedido
        const resultadoPedido = await pedidoValidator.validarPedido(id)
        
        if (!resultadoPedido.ok) {
            return responseValidator.respuestaErrorWeb(res, VISTA_ACTUALIZAR_PEDIDO, resultadoPedido, datosFormulario)
        }

        // fecha entrega esperada
        const resultadoFechaEsperada = pedidoValidator.validarFechaEntregaEsperada(fecha_entrega_esperada)

        if (!resultadoFechaEsperada.ok) {
            return responseValidator.respuestaErrorWeb(res, VISTA_ACTUALIZAR_PEDIDO, resultadoFechaEsperada, datosFormulario)
        }

        // fecha entrega real
        const resultadoFechaReal = pedidoValidator.validarFechaEntregaReal(fecha_entrega_real)

        if (!resultadoFechaReal.ok) {
            return responseValidator.respuestaErrorWeb(res, VISTA_ACTUALIZAR_PEDIDO, resultadoFechaReal, datosFormulario)
        }

        // actor
        const resultadoActor = await pedidoValidator.validarActor(id_actor)

        if (!resultadoActor.ok) {
            return responseValidator.respuestaErrorWeb(res, VISTA_ACTUALIZAR_PEDIDO, resultadoActor, datosFormulario)
        }

        // estado
        const resultadoEstado = await pedidoValidator.validarEstado(estado)

        if (!resultadoEstado.ok) {
            return responseValidator.respuestaErrorWeb(res, VISTA_ACTUALIZAR_PEDIDO, resultadoEstado, datosFormulario)
        }

        // entrega de datos normalizados
        req.body.fecha_entrega_esperada = resultadoFechaEsperada.valor
        req.body.fecha_entrega_real = resultadoFechaReal.valor
        req.body.estado = resultadoEstado.valor
        req.body.id_actor = resultadoActor.valor.id

        next()
    } catch (error) {
        res.status(500).render("error", { mensaje: "Error validando pedido" })
    }
}

export { validarCrearPedidoWeb, validarActualizarPedidoWeb }
