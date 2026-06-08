const ESTADOS_PEDIDO = Object.freeze({
    PENDIENTE: 'PENDIENTE',
    EN_PRODUCCION: 'EN_PRODUCCION',
    DESPACHADO: 'DESPACHADO',
    ENTREGADO: 'ENTREGADO',
})

const obtenerEstadosPedido = () => {
    return Object.values(ESTADOS_PEDIDO)
}

export { ESTADOS_PEDIDO, obtenerEstadosPedido }
