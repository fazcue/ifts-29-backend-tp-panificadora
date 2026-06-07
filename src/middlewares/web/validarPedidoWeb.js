import responseValidator from "../../validators/response.validator.js"
import pedidoService from "../../services/pedidoService.js"
import actorService from "../../services/actorService.js"
import pedidoValidator from "../../validators/pedido.validator.js"
import productoService from "../../services/productoService.js"
import { esPlanta } from "../../lib/roles.js"

// vistas
const VISTA_CREAR_PEDIDO = 'pedidos/nuevo'
const VISTA_ACTUALIZAR_PEDIDO = 'pedidos/editar'

const agregarCantidadesFormulario = (productosActivos, productosFormulario = []) => {
    return productosActivos.map((producto) => {
        const productoFormulario = productosFormulario.find((item) => String(item.id_producto) === String(producto.id))

        return {
            ...producto.toObject(),
            id: producto.id,
            cantidad_pedida: productoFormulario?.cantidad || ""
        }
    })
}

const productosExistentesPedido = (pedido) => {
    return (pedido.productos || [])
        .filter((detalle) => detalle.producto)
        .map((detalle) => ({
            id_producto: detalle.producto._id || detalle.producto,
            precio_unitario: detalle.precio_unitario
        }))
}

// datos de formulario al crear nuevo pedido
const datosFormularioCrear = async (fecha_entrega_esperada, id_actor) => {
    const [ actoresActivos, productosActivos ] = await Promise.all([
        actorService.obtenerActoresActivos(),
        productoService.obtenerProductosActivos()
    ])

    return {
        pedido: {
            fecha_entrega_esperada,
            actor: id_actor
        },
        actores: actoresActivos,
        productos: productosActivos
    }
}

// datos de formulario al actualizar nuevo pedido
const datosFormularioActualizar = async (id, fecha_entrega_esperada, fecha_entrega_real, estado, id_actor, productos = []) => {
    const [actoresActivos, productosActivos, estados, pedidoActual] = await Promise.all([
        actorService.obtenerActoresActivos(),
        productoService.obtenerProductosActivos(),
        pedidoService.obtenerEstados(),
        pedidoService.buscarPedidoPorId(id)
    ])

    return {
        pedido: {
            ...pedidoActual,
            fecha_entrega_esperada,
            fecha_entrega_real,
            estado,
            actor: id_actor
        },
        actores: actoresActivos,
        estados,
        productos: agregarCantidadesFormulario(productosActivos, productos)
    }
}

const validarCrearPedidoWeb = async (req, res, next) => {
    try {
        const { fecha_entrega_esperada, productos } = req.body
        let id_actor = req.body.id_actor

        // datos formulario (necesario para el render)
        const datosFormulario = await datosFormularioCrear(fecha_entrega_esperada, id_actor)

        // fecha entrega esperada
        const resultadoFechaEsperada = pedidoValidator.validarFechaEntregaEsperada(fecha_entrega_esperada)

        if (!resultadoFechaEsperada.ok) {
            return responseValidator.respuestaErrorWeb(res, VISTA_CREAR_PEDIDO, resultadoFechaEsperada, datosFormulario)
        }

        // id actor (si no es PLANTA, debe ser igual a user.id)
        if (!esPlanta(req.session.user)) {
            id_actor = req.session.user.id
        }

        // actor
        const resultadoActor = await pedidoValidator.validarActor(id_actor)

        if (!resultadoActor.ok) {
            return responseValidator.respuestaErrorWeb(res, VISTA_CREAR_PEDIDO, resultadoActor, datosFormulario)
        }

        // productos
        const resultadoProductos = await pedidoValidator.validarProductos(productos)

        if (!resultadoProductos.ok) {
            return responseValidator.respuestaErrorWeb(res, VISTA_CREAR_PEDIDO, resultadoProductos, datosFormulario)
        }

        // entrega de datos normalizados
        req.body.fecha_entrega_esperada = resultadoFechaEsperada.valor
        req.body.id_actor = resultadoActor.valor.id
        req.body.productos = resultadoProductos.valor

        next()
    } catch (err) {
        return res.status(500).render('error', { mensaje: "Error validando pedido" })
    }
}

const validarActualizarPedidoWeb = async (req, res, next) => {
    try {
        let { fecha_entrega_esperada, fecha_entrega_real, estado, id_actor, productos } = req.body
        const { id } = req.params

        // datos formulario (necesario para el render)
        const datosFormulario = await datosFormularioActualizar(id, fecha_entrega_esperada, fecha_entrega_real, estado, id_actor, productos)

        // pedido
        const resultadoPedido = await pedidoValidator.validarPedido(id, true)

        if (!resultadoPedido.ok) {
            return responseValidator.respuestaErrorWeb(res, VISTA_ACTUALIZAR_PEDIDO, resultadoPedido, datosFormulario)
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
            return responseValidator.respuestaErrorWeb(res, VISTA_ACTUALIZAR_PEDIDO, resultadoFechaEsperada, datosFormulario)
        }

        // fecha entrega real
        const resultadoFechaReal = pedidoValidator.validarFechaEntregaReal(fecha_entrega_real)

        if (!resultadoFechaReal.ok) {
            return responseValidator.respuestaErrorWeb(res, VISTA_ACTUALIZAR_PEDIDO, resultadoFechaReal, datosFormulario)
        }

        // actor
        const idActorPedido = resultadoPedido.valor.actor?._id || resultadoPedido.valor.actor
        const validarActivo = idActorPedido?.toString() !== id_actor
        const resultadoActor = await pedidoValidator.validarActor(id_actor, validarActivo)

        if (!resultadoActor.ok) {
            return responseValidator.respuestaErrorWeb(res, VISTA_ACTUALIZAR_PEDIDO, resultadoActor, datosFormulario)
        }

        // estado
        const resultadoEstado = await pedidoValidator.validarEstado(estado)

        if (!resultadoEstado.ok) {
            return responseValidator.respuestaErrorWeb(res, VISTA_ACTUALIZAR_PEDIDO, resultadoEstado, datosFormulario)
        }

        // productos
        const resultadoProductos = await pedidoValidator.validarProductos(productos, productosExistentesPedido(resultadoPedido.valor))

        if (!resultadoProductos.ok) {
            return responseValidator.respuestaErrorWeb(res, VISTA_ACTUALIZAR_PEDIDO, resultadoProductos, datosFormulario)
        }

        // entrega de datos normalizados
        req.body.fecha_entrega_esperada = resultadoFechaEsperada.valor
        req.body.fecha_entrega_real = resultadoFechaReal.valor
        req.body.estado = resultadoEstado.valor
        req.body.id_actor = resultadoActor.valor.id
        req.body.productos = resultadoProductos.valor

        next()
    } catch (error) {
        res.status(500).render("error", { mensaje: "Error validando pedido" })
    }
}

export { validarCrearPedidoWeb, validarActualizarPedidoWeb }
