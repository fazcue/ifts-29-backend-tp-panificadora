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
    if (!io || !pedido) return

    const actorId = pedido.actor?.toString?.()
    const idActorAntiguo = pedido.idActorAntiguo?.toString?.()
    const cambioActor = idActorAntiguo && idActorAntiguo !== actorId

    const idActuante = usuarioActuante?.id?.toString?.()
    const tipoActuante = usuarioActuante?.tipo

    const basePayload = {
        id: pedido.id,
        estado: pedido.estado,
    }

    // Notificar al actor antiguo si cambió (y no es el actuante)
    if (cambioActor && idActuante !== idActorAntiguo) {
        io.to(`actor:${idActorAntiguo}`).emit('pedido:actualizado', {
            ...basePayload,
            mensaje: 'Pedido reasignado',
        })
    }

    // Notificar al actor actual (si no es el actuante)
    if (actorId && idActuante !== actorId) {
        io.to(`actor:${actorId}`).emit('pedido:actualizado', {
            ...basePayload,
            mensaje: cambioActor ? 'Pedido nuevo' : 'Pedido actualizado.',
        })
    }

    // Notificar a PLANTA (si el actuante no es PLANTA)
    if (tipoActuante !== TIPOS_ACTOR.PLANTA) {
        io.to(`tipo:${TIPOS_ACTOR.PLANTA}`).emit('pedido:actualizado', {
            ...basePayload,
            mensaje: 'Pedido actualizado.',
        })
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
