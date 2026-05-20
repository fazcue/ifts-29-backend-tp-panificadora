import actorService from "../../services/actorService.js"
import pedidoService from "../../services/pedidoService.js"

const listarPedidosWeb = async (req, res) => {
    try {
        const pedidos = await pedidoService.obtenerPedidosConActores()
        const titulo = "Listado de pedidos"

        res.render("pedidos/listado", { pedidos, titulo })
    } catch (error) {
        res.status(500).send("Error al cargar listado de pedidos")
    }
}

const formularioNuevoPedidoWeb = async (req, res) => {
    try {
        const actores = await actorService.obtenerActoresActivos()
        const titulo = "Alta de nuevo pedido"

        res.render("pedidos/nuevo", { actores, titulo })
    } catch (error) {
        res.status(500).send("Error al cargar formulario nuevo pedido")
    }
}

const crearPedidoWeb = async (req, res) => {
    try {
        const { fecha_entrega_esperada, id_actor } = req.body

        await pedidoService.crearPedido(fecha_entrega_esperada, id_actor)

        res.redirect("/pedidos")
    } catch (error) {
        res.status(500).send("Error al crear pedido")
    }
}

const formularioEditarPedidoWeb = async (req, res) => {
    try {
        const id = req.params.id
        const pedido = await pedidoService.buscarPedidoPorId(id)

        if (!pedido) {
            return res.status(404).render("error", { mensaje: "Pedido no encontrado" })
        }

        // actores activos + actual (aunque este inactivo)
        const [ actoresActivos, actorActual ] = await Promise.all([
            actorService.obtenerActoresActivos(),
            actorService.buscarActorPorId(pedido.actor)
        ])

        let actores = actoresActivos

        if (actorActual && !actorActual.activo) {
            actores = [...actores, actorActual]
        }

        // estados + titulo
        const estados = pedidoService.obtenerEstados()
        const titulo = `Editar pedido #${pedido.id}`

        res.render("pedidos/editar", { pedido, actores, estados, titulo })
    } catch (error) {
        res.status(500).send("Error al cargar formulario editar pedido")
    }
}

const actualizarPedidoWeb = async (req, res) => {
    try {
        const id = req.params.id
        const { fecha_entrega_esperada, fecha_entrega_real, estado, id_actor } = req.body

        const pedido = await pedidoService.actualizarPedido(id, fecha_entrega_esperada, fecha_entrega_real, estado, id_actor)

        if (!pedido) {
            return res.status(404).render("error", { mensaje: "Pedido no encontrado" })
        }

        res.redirect("/pedidos")
    } catch (error) {
        res.status(500).send("Error al actualizar pedido")
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
        res.status(500).send("Error al eliminar pedido")
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
