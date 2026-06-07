import actorService from "../../services/actorService.js"
import pedidoService from "../../services/pedidoService.js"
import productoService from '../../services/productoService.js'
import { esPlanta } from "../../lib/roles.js"

const listarPedidosWeb = async (req, res) => {
    try {
        const actorLogueado = req.session.user
        const filtro = esPlanta(actorLogueado) ? {} : { actor: actorLogueado.id }

        const pedidos = await pedidoService.obtenerPedidos(filtro)
        const titulo = "Listado de pedidos"

        res.render("pedidos/listado", { pedidos, titulo })
    } catch (error) {
        res.status(500).render("error", { mensaje: "Error al cargar listado de pedidos" })
    }
}

const crearPedidoWeb = async (req, res) => {
    try {
        const { fecha_entrega_esperada, id_actor, productos } = req.body

        await pedidoService.crearPedido(fecha_entrega_esperada, id_actor, productos)

        res.redirect("/pedidos")
    } catch (error) {
        res.status(500).render("error", { mensaje: "Error al crear pedido" })
    }
}

const actualizarPedidoWeb = async (req, res) => {
    try {
        const id = req.params.id
        const { fecha_entrega_esperada, fecha_entrega_real, estado, id_actor, productos } = req.body

        const pedido = await pedidoService.actualizarPedido(id, fecha_entrega_esperada, fecha_entrega_real, estado, id_actor, productos)

        if (!pedido) {
            return res.status(404).render("error", { mensaje: "Pedido no encontrado" })
        }

        res.redirect("/pedidos")
    } catch (error) {
        res.status(500).render("error", { mensaje: "Error al actualizar pedido" })
    }
}

const eliminarPedidoWeb = async (req, res) => {
    try {
        const id = req.params.id
        
        const pedido = await pedidoService.eliminarPedido(id)

        if (!pedido) {
            return res.status(404).render("error", { mensaje: "Pedido no encontrado" })
        }

        res.redirect("/pedidos")
    } catch (error) {
        res.status(500).render("error", { mensaje: "Error al eliminar pedido" })
    }
}

// formularios
const formularioNuevoPedidoWeb = async (req, res) => {
    try {
        const actorLogueado = req.session.user

        const [ actores, productos ] = await Promise.all([
            esPlanta(actorLogueado) ? actorService.obtenerActoresActivos() : actorService.buscarActorPorId(actorLogueado.id),
            productoService.obtenerProductosActivos()
        ])

        const titulo = "Alta de nuevo pedido"

        res.render("pedidos/nuevo", { actores, productos, titulo })
    } catch (error) {
        res.status(500).render("error", { mensaje: "Error al cargar formulario nuevo pedido" })
    }
}

const formularioEditarPedidoWeb = async (req, res) => {
    try {
        const id = req.params.id
        const datosPedido = await pedidoService.obtenerPedidoParaEditar(id)

        if (!datosPedido) {
            return res.status(404).render("error", { mensaje: "Pedido no encontrado" })
        }

        const { pedido, productos } = datosPedido
        const idActor = pedido.actor?._id || pedido.actor

        // data
        const [ actoresActivos, actorActual ] = await Promise.all([
            actorService.obtenerActoresActivos(),
            actorService.buscarActorPorId(idActor)
        ])

        // actores activos + actual (aunque este inactivo)
        let actores = actoresActivos

        if (actorActual && !actorActual.activo) {
            actores = [...actores, actorActual]
        }

        // estados + titulo
        const estados = pedidoService.obtenerEstados()
        const titulo = `Editar pedido #${pedido.id}`
        const pedidoFormulario = {
            ...pedido.toObject(),
            id: pedido.id,
            actor: String(idActor)
        }

        res.render("pedidos/editar", { pedido: pedidoFormulario, actores, estados, productos, titulo })
    } catch (error) {
        res.status(500).render("error", { mensaje: "Error al cargar formulario editar pedido" })
    }
}

export {
    listarPedidosWeb,
    formularioNuevoPedidoWeb,
    crearPedidoWeb,
    formularioEditarPedidoWeb,
    actualizarPedidoWeb,
    eliminarPedidoWeb
}
