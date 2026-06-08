import pedidoService from '../services/pedidoService.js'

const cargarPedido = async (req) => {
    return await pedidoService.buscarPedidoPorId(req.params.id, 'actor estado')
}

export { cargarPedido }
