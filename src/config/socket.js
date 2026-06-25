import { Server as SocketIOServer } from 'socket.io'
import { configurarSesion } from './session.js'

const configurarSocket = (server, app) => {
    const io = new SocketIOServer(server, {
        connectionStateRecovery: {},
    })

    io.engine.use(configurarSesion)

    // Middleware de autenticación
    io.use((socket, next) => {
        const usuario = socket.request.session?.user

        if (!usuario) {
            return next(new Error('Usuario no autenticado'))
        }

        socket.usuarioId = usuario.id
        socket.usuarioTipo = usuario.tipo
        next()
    })

    io.on('connection', (socket) => {
        console.log(`[Socket] Conectado: ${socket.usuarioId} (${socket.usuarioTipo})`)

        // Sala personal — recibe notificaciones de sus propios pedidos
        socket.join(`actor:${socket.usuarioId}`)

        // Sala por tipo — recibe notificaciones según su rol
        socket.join(`tipo:${socket.usuarioTipo}`)

        socket.on('disconnect', () => {
            console.log(`[Socket] Desconectado: ${socket.usuarioId}`)
        })
    })

    // Guardar instancia para usar desde controllers
    app.set('io', io)

    return io
}

export default configurarSocket
