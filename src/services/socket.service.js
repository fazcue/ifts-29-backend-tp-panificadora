import { TIPOS_ACTOR } from '../lib/tiposActor.js'

const emitirEventoPedidoNuevo = (req, pedido, usuarioActuante) => {
    const io = req.app.get('io')

    if (io && pedido) {
        const actorId = pedido.actor?.toString?.()

        const payload = {
            id: pedido.id,
            estado: pedido.estado,
        }

        const idActuante = usuarioActuante?.id?.toString?.()
        const tipoActuante = usuarioActuante?.tipo

        // Notificar al actor asignado (solo si no es el propio actuante)
        if (actorId && idActuante !== actorId) {
            io.to(`actor:${actorId}`).emit('pedido:nuevo', {
                ...payload,
                mensaje: `Nuevo pedido para vos`,
            })
        }

        // Notificar a PLANTA (solo si el actuante no es PLANTA)
        if (tipoActuante !== TIPOS_ACTOR.PLANTA) {
            io.to(`tipo:${TIPOS_ACTOR.PLANTA}`).emit('pedido:nuevo', {
                ...payload,
                mensaje: `Nuevo pedido recibido`,
            })
        }
    }
}

const emitirEventoPedidoActualizado = (req, pedido, usuarioActuante) => {
    const io = req.app.get('io')

    if (io && pedido) {
        const actorId = pedido.actor?.toString?.()
        const idActorAntiguo = pedido.idActorAntiguo?.toString?.()

        const payload = {
            id: pedido.id,
            estado: pedido.estado,
            mensaje: `Pedido actualizado.`,
        }

        const idActuante = usuarioActuante?.id?.toString?.()
        const tipoActuante = usuarioActuante?.tipo

        // Si cambió el actor, notificar al anterior (solo si no es el actuante)
        if (idActorAntiguo && idActorAntiguo !== actorId && idActuante !== idActorAntiguo) {
            io.to(`actor:${idActorAntiguo}`).emit('pedido:actualizado', {
                ...payload,
                mensaje: `Pedido reasignado`,
            })
        }

        // Notificar al actor actual (solo si no es el propio actuante)
        if (actorId && idActuante !== actorId) {
            io.to(`actor:${actorId}`).emit('pedido:actualizado', payload)
        }

        // Notificar a PLANTA (solo si el actuante no es PLANTA)
        if (tipoActuante !== TIPOS_ACTOR.PLANTA) {
            io.to(`tipo:${TIPOS_ACTOR.PLANTA}`).emit('pedido:actualizado', payload)
        }
    }
}

const emitirEventoPedidoEliminado = (req, pedido, usuarioActuante) => {
    const io = req.app.get('io')

    if (io && pedido) {
        const actorId = pedido.actor?.toString?.()

        const payload = {
            id: pedido.id,
            mensaje: `Pedido eliminado`,
        }

        const idActuante = usuarioActuante?.id?.toString?.()
        const tipoActuante = usuarioActuante?.tipo

        // Notificar al actor asignado (solo si no es el propio actuante)
        if (actorId && idActuante !== actorId) {
            io.to(`actor:${actorId}`).emit('pedido:eliminado', payload)
        }

        // Notificar a PLANTA (solo si el actuante no es PLANTA)
        if (tipoActuante !== TIPOS_ACTOR.PLANTA) {
            io.to(`tipo:${TIPOS_ACTOR.PLANTA}`).emit('pedido:eliminado', payload)
        }
    }
}

export {
    emitirEventoPedidoNuevo,
    emitirEventoPedidoActualizado,
    emitirEventoPedidoEliminado
}
