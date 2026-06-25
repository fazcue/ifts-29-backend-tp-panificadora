import { TIPOS_ACTOR } from '../lib/tiposActor.js'

const emitirEventoPedidoNuevo = (req, pedido) => {
    const io = req.app.get('io')

    if (io && pedido) {
        const actorId = pedido.actor?.toString?.()

        const payload = {
            id: pedido.id,
            estado: pedido.estado,
        }

        // Notificar al dueño
        if (actorId) {
            io.to(`actor:${actorId}`).emit('pedido:nuevo', {
                ...payload,
                mensaje: `Nuevo pedido para vos`,
            })
        }

        // Notificar a PLANTA
        io.to(`tipo:${TIPOS_ACTOR.PLANTA}`).emit('pedido:nuevo', {
            ...payload,
            mensaje: `Nuevo pedido recibido`,
        })
    }
}

const emitirEventoPedidoActualizado = (req, pedido) => {
    const io = req.app.get('io')

    if (io && pedido) {
        const actorId = pedido.actor?.toString?.()

        const payload = {
            id: pedido.id,
            estado: pedido.estado,
            mensaje: `Pedido actualizado.`
        }

        // Notificar al dueño
        if (actorId) {
            io.to(`actor:${actorId}`).emit('pedido:actualizado', payload)
        }

        // Notificar a PLANTA
        io.to(`tipo:${TIPOS_ACTOR.PLANTA}`).emit('pedido:actualizado', payload)
    }
}

const emitirEventoPedidoEliminado = (req, pedido) => {
    const io = req.app.get('io')

    if (io && pedido) {
        const actorId = pedido.actor?.toString?.()

        const payload = {
            id: pedido.id,
            mensaje: `Pedido eliminado`,
        }

        // Notificar al dueño
        if (actorId) {
            io.to(`actor:${actorId}`).emit('pedido:eliminado', payload)
        }

        // Notificar a PLANTA
        io.to(`tipo:${TIPOS_ACTOR.PLANTA}`).emit('pedido:eliminado', payload)
    }
}

export {
    emitirEventoPedidoNuevo,
    emitirEventoPedidoActualizado,
    emitirEventoPedidoEliminado
}
