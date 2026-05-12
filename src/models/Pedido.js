class Pedido {
    constructor(fechaEntregaEsperada, idActor) {
        this.id = Date.now()
        this.fecha_pedido = new Date().toISOString()
        this.fecha_entrega_esperada = fechaEntregaEsperada
        this.fecha_entrega_real = null
        this.estado = "PENDIENTE"
        this.id_actor = +idActor
    }
}

export default Pedido
