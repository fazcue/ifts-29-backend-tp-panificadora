import pedidoService from "../../services/pedidoService.js"
import { esPlanta } from "../../lib/tiposActor.js"
import { responderErrorApi } from "../../lib/errorResponses.js"

const listarPedidos = async (req, res) => {
    try {
        const actorLogueado = req.session.user
        const filtro = esPlanta(actorLogueado) ? {} : { actor: actorLogueado.id }
        const pedidos = await pedidoService.obtenerPedidos(filtro)

        res.status(200).json(pedidos)
    } catch (error) {
        responderErrorApi(res, error, "Error al listar pedidos")
    }
}

const listarPedido = async (req, res) => {
    try {
        const id = req.params.id
        const pedido = await pedidoService.buscarPedidoPorIdConDetalles(id)

        if (!pedido) {
            return res.status(404).json({ error: "Pedido no encontrado" })
        }

        res.status(200).json(pedido)
    } catch (error) {
        responderErrorApi(res, error, "Error al listar pedido")
    }
}

const crearPedido = async (req, res) => {
    try {
        const { fecha_entrega_esperada, id_actor, productos } = req.body

        const nuevo = await pedidoService.crearPedido(fecha_entrega_esperada, id_actor, productos)

        res.status(201).json(nuevo)
    } catch (error) {
        responderErrorApi(res, error, "Error al crear pedido")
    }
}

const actualizarPedido = async (req, res) => {
    try {
        const id = req.params.id
        const { fecha_entrega_esperada, estado, id_actor, productos } = req.body

        const pedido = await pedidoService.actualizarPedido(id, fecha_entrega_esperada, estado, id_actor, productos)

        if (!pedido) {
            return res.status(404).json({ error: "Pedido no encontrado" })
        }

        res.status(200).json(pedido)
    } catch (error) {
        responderErrorApi(res, error, "Error al actualizar pedido")
    }
}

const eliminarPedido = async (req, res) => {
    try {
        const id = req.params.id
        
        const pedido = await pedidoService.eliminarPedido(id)

        if (!pedido) {
            return res.status(404).json({ error: "Pedido no encontrado" })
        }

        res.status(200).json(pedido)
    } catch (error) {
        responderErrorApi(res, error, "Error al eliminar pedido")
    }
}

export { listarPedidos, listarPedido, crearPedido, actualizarPedido, eliminarPedido }
