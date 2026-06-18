import express from 'express'
import dotenv from 'dotenv'
import conectarDB from './config/db.js'
import { configurarSesion, inyectarDatosUsuario } from './config/session.js'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
// Rutas API
import actoresRouter from './routes/api/actoresRoutes.js'
import pedidosRouter from './routes/api/pedidosRoutes.js'
import productosRouter from './routes/api/productosRoutes.js'
import insumosRouter from './routes/api/insumosRoutes.js'
// Rutas Web
import loginRouterWeb from './routes/web/loginRoutes.js'
import actoresRouterWeb from './routes/web/actoresRoutes.js'
import pedidosRouterWeb from './routes/web/pedidosRoutes.js'
import productosRouterWeb from './routes/web/productosRoutes.js'
import reportesRouterWeb from './routes/web/reportesRoutes.js'
import insumosRouterWeb from './routes/web/insumosRoutes.js'

import { protegerApi, protegerWeb } from './middlewares/auth.js'

dotenv.config()

const PUERTO = process.env.PUERTO || 3000
const app = express()
const __dirname = dirname(fileURLToPath(import.meta.url))

// Soporte vercel
app.set('trust proxy', 1)

// Middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static("public"))

// Sesiones
app.use(configurarSesion)
app.use(inyectarDatosUsuario)

// Motor plantillas Pug
app.set("view engine", "pug")
app.set("views", join(__dirname, "views"))

// Rutas web
app.use('/', loginRouterWeb)
app.use('/actores', protegerWeb, actoresRouterWeb)
app.use('/pedidos', protegerWeb, pedidosRouterWeb)
app.use('/productos', protegerWeb, productosRouterWeb)
app.use('/insumos', protegerWeb, insumosRouterWeb)
app.use('/reportes', protegerWeb, reportesRouterWeb)

// Rutas API
app.use('/api/actores', protegerApi, actoresRouter)
app.use('/api/pedidos', protegerApi, pedidosRouter)
app.use('/api/productos', protegerApi, productosRouter)
app.use('/api/insumos', protegerApi, insumosRouter)

// 404
app.use('/api', (req, res) => res.status(404).json({ error: 'Recurso no encontrado' }))
app.use((req, res) => res.status(404).render('error', { mensaje: 'Página no encontrada' }))

// MongoDB
await conectarDB()

// Servidor
app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en http://localhost:${PUERTO}`)
})
