import pedidoService from '../services/pedido.service.js'
import pedidoValidator from '../validators/pedido.validator.js'
import { esPlanta } from '../lib/tiposActor.js'
import { respuestaError } from '../validators/response.validator.js'

const VISTA_CREAR = 'pedidos/nuevo'
const VISTA_ACTUALIZAR = 'pedidos/editar'

const validarCrearPedidoBase = async (req, res, next, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const { fecha_entrega_esperada, productos } = req.body
        let id_actor = req.body.id_actor

        // Si no se enviaron productos, usar array vacio
        const productosNormalizados = productos ?? []

        // Preparar datos del formulario (solo web)
        let datosFormulario = {}

        if (esWeb) {
            datosFormulario = await pedidoService.obtenerDatosParaCrearPedido(fecha_entrega_esperada, id_actor)
        }

        // fecha entrega esperada
        const resultadoFechaEsperada = pedidoValidator.validarFechaEntregaEsperada(fecha_entrega_esperada)

        if (!resultadoFechaEsperada.ok) {
            return respuestaError(res, resultadoFechaEsperada, esWeb, VISTA_CREAR, datosFormulario)
        }

        // id actor (si no es PLANTA, debe ser igual a user.id)
        if (!esPlanta(req.session.user)) {
            id_actor = req.session.user.id
        }

        // actor
        const resultadoActor = await pedidoValidator.validarActor(id_actor)

        if (!resultadoActor.ok) {
            return respuestaError(res, resultadoActor, esWeb, VISTA_CREAR, datosFormulario)
        }

        // productos
        const resultadoProductos = await pedidoValidator.validarProductos(productosNormalizados)

        if (!resultadoProductos.ok) {
            return respuestaError(res, resultadoProductos, esWeb, VISTA_CREAR, datosFormulario)
        }

        // datos normalizados
        req.body.fecha_entrega_esperada = resultadoFechaEsperada.valor
        req.body.id_actor = resultadoActor.valor.id
        req.body.productos = resultadoProductos.valor

        next()
    } catch (err) {
        const resultado = { estado: 500, mensaje: 'Error validando pedido' }
        return respuestaError(res, resultado, esWeb)
    }
}

const validarActualizarPedidoBase = async (req, res, next, opciones) => {
    const esWeb = opciones.esWeb

    try {
        let { fecha_entrega_esperada, estado, id_actor, productos } = req.body
        const { id } = req.params

        // Preparar datos del formulario (solo web)
        let datosFormulario = {}

        if (esWeb) {
            datosFormulario = await pedidoService.obtenerDatosParaActualizarPedido(id, fecha_entrega_esperada, estado, id_actor, productos)
        }

        // pedido
        const resultadoPedido = await pedidoValidator.validarPedido(id, true)

        if (!resultadoPedido.ok) {
            return respuestaError(res, resultadoPedido, esWeb, VISTA_ACTUALIZAR, datosFormulario)
        }

        // si no es planta, mantener valores de atributos no editables
        if (!esPlanta(req.session.user)) {
            estado = resultadoPedido.valor.estado
            id_actor = resultadoPedido.valor.actor.id
        }

        // fecha entrega esperada
        const resultadoFechaEsperada = pedidoValidator.validarFechaEntregaEsperada(fecha_entrega_esperada)

        if (!resultadoFechaEsperada.ok) {
            return respuestaError(res, resultadoFechaEsperada, esWeb, VISTA_ACTUALIZAR, datosFormulario)
        }

        // actor
        const idActorPedido = resultadoPedido.valor.actor?._id || resultadoPedido.valor.actor
        const validarActivo = idActorPedido?.toString() !== id_actor

        const resultadoActor = await pedidoValidator.validarActor(id_actor, validarActivo)

        if (!resultadoActor.ok) {
            return respuestaError(res, resultadoActor, esWeb, VISTA_ACTUALIZAR, datosFormulario)
        }

        // estado
        const resultadoEstado = await pedidoValidator.validarEstado(estado)

        if (!resultadoEstado.ok) {
            return respuestaError(res, resultadoEstado, esWeb, VISTA_ACTUALIZAR, datosFormulario)
        }

        // productos
        const resultadoProductos = await pedidoValidator.validarProductos(
            productos,
            pedidoService.productosExistentesPedido(resultadoPedido.valor),
        )

        if (!resultadoProductos.ok) {
            return respuestaError(res, resultadoProductos, esWeb, VISTA_ACTUALIZAR, datosFormulario)
        }

        // datos normalizados
        req.body.fecha_entrega_esperada = resultadoFechaEsperada.valor
        delete req.body.fecha_entrega_real
        req.body.estado = resultadoEstado.valor
        req.body.id_actor = resultadoActor.valor.id
        req.body.productos = resultadoProductos.valor

        next()
    } catch (err) {
        const resultado = { estado: 500, mensaje: 'Error validando pedido' }
        return respuestaError(res, resultado, esWeb)
    }
}

const validarCrearPedidoApi = (req, res, next) => {
    return validarCrearPedidoBase(req, res, next, { esWeb: false })
}

const validarActualizarPedidoApi = (req, res, next) => {
    return validarActualizarPedidoBase(req, res, next, { esWeb: false })
}

const validarCrearPedidoWeb = (req, res, next) => {
    return validarCrearPedidoBase(req, res, next, { esWeb: true })
}

const validarActualizarPedidoWeb = (req, res, next) => {
    return validarActualizarPedidoBase(req, res, next, { esWeb: true })
}

export {
    validarCrearPedidoApi,
    validarActualizarPedidoApi,
    validarCrearPedidoWeb,
    validarActualizarPedidoWeb,
}
