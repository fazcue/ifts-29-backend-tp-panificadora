import { createServer } from 'http'
import app from './app.js'
import conectarDB from './config/db.js'
import configurarSocket from './config/socket.js'

const PUERTO = process.env.PUERTO || 3000

try {
    // MongoDB
    await conectarDB()

    // Servidor HTTP + Socket.io
    const server = createServer(app)
    configurarSocket(server, app)

    server.listen(PUERTO, () => {
        console.log(`Servidor corriendo en http://localhost:${PUERTO}`)
    })
} catch (error) {
    console.error('Error al iniciar la aplicación:', error)
    process.exit(1)
}
