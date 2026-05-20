import express from 'express'
import dotenv from 'dotenv'
import conectarDB from './config/db.js'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
// Rutas API
import actoresRouter from './routes/api/actoresRoutes.js'
import pedidosRouter from './routes/api/pedidosRoutes.js'
import productosRouter from './routes/api/productosRoutes.js'
// Rutas Web
import actoresRouterWeb from './routes/web/actoresRoutes.js'
import pedidosRouterWeb from './routes/web/pedidosRoutes.js'
import productosRouterWeb from './routes/web/productosRoutes.js'

dotenv.config()

const PUERTO = process.env.PUERTO || 3000
const app = express()
const __dirname = dirname(fileURLToPath(import.meta.url))

// Middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static("public"))

// Motor plantillas Pug
app.set("view engine", "pug")
app.set("views", join(__dirname, "views"))

// Rutas web
app.use('/actores', actoresRouterWeb)
app.use('/pedidos', pedidosRouterWeb)
app.use('/productos', productosRouterWeb)

// Rutas API
app.use('/api/actores', actoresRouter)
app.use('/api/pedidos', pedidosRouter)
app.use('/api/productos', productosRouter)

// Inicio
app.get('/', (req, res) => res.render('portada'))

// 404
app.use('/api', (req, res) => res.status(404).json({ error: 'Recurso no encontrado' }))
app.use((req, res) => res.status(404).render('error', { mensaje: 'Página no encontrada' }))

// MongoDB
await conectarDB()

// Servidor
app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en http://localhost:${PUERTO}`)
})
