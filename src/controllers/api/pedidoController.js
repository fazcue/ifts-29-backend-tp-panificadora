import pedidoService from "../../services/pedidoService.js"

const listarPedidos = async (req, res) => {
    try {
        const pedidos = await pedidoService.obtenerPedidos()

        res.status(200).json(pedidos)
    } catch (error) {
        res.status(500).json({ error: "Error al listar pedidos" })
    }
}

const listarPedido = async (req, res) => {
    try {
        const id = req.params.id
        const pedido = await pedidoService.buscarPedidoPorId(id)

        if (!pedido) {
            return res.status(404).json({ error: "Pedido no encontrado" })
        }

        res.status(200).json(pedido)
    } catch (error) {
        res.status(500).json({ error: "Error al listar pedido" })
    }
}

const crearPedido = async (req, res) => {
    try {
        const { fecha_entrega_esperada, id_actor } = req.body

        const nuevo = await pedidoService.crearPedido(fecha_entrega_esperada, id_actor)

        res.status(201).json(nuevo)
    } catch (error) {
        res.status(500).json({ error: "Error al crear pedido" })
    }
}

const actualizarPedido = async (req, res) => {
    try {
        const id = req.params.id
        const { fecha_entrega_esperada, fecha_entrega_real, estado, id_actor } = req.body

        const pedido = await pedidoService.actualizarPedido(id, fecha_entrega_esperada, fecha_entrega_real, estado, id_actor)

        if (!pedido) {
            return res.status(404).json({ error: "Pedido no encontrado" })
        }

        res.status(200).json(pedido)
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar pedido" })
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
        res.status(500).json({ error: "Error al eliminar pedido" })
    }
}

export { listarPedidos, listarPedido, crearPedido, actualizarPedido, eliminarPedido }
