import pedidoService from '../services/pedido.service.js'

const cargarPedido = async (req) => {
    return await pedidoService.buscarPedidoPorId(req.params.id, 'actor estado')
}

export { cargarPedido }
