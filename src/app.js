import express from 'express'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { configurarSesion, inyectarDatosUsuario } from './config/session.js'

// Rutas API
import loginApiRouter from './routes/api/loginRoutes.js'
import actoresRouter from './routes/api/actoresRoutes.js'
import pedidosRouter from './routes/api/pedidosRoutes.js'
import productosRouter from './routes/api/productosRoutes.js'
import insumosRouter from './routes/api/insumosRoutes.js'
import royaltiesRouter from './routes/api/royaltiesRoutes.js'

// Rutas Web
import loginRouterWeb from './routes/web/loginRoutes.js'
import actoresRouterWeb from './routes/web/actoresRoutes.js'
import pedidosRouterWeb from './routes/web/pedidosRoutes.js'
import productosRouterWeb from './routes/web/productosRoutes.js'
import reportesRouterWeb from './routes/web/reportesRoutes.js'
import insumosRouterWeb from './routes/web/insumosRoutes.js'
import royaltiesRouterWeb from './routes/web/royaltiesRoutes.js'

import { protegerApi, protegerWeb } from './middlewares/auth.middleware.js'

const app = express()
const __dirname = dirname(fileURLToPath(import.meta.url))

// Soporte para proxies
app.set('trust proxy', 1)

// Middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('public'))

// Sesiones
app.use(configurarSesion)
app.use(inyectarDatosUsuario)

// Motor de plantillas
app.set('view engine', 'pug')
app.set('views', join(__dirname, 'views'))

// Rutas Web
app.use('/', loginRouterWeb)
app.use('/actores', protegerWeb, actoresRouterWeb)
app.use('/pedidos', protegerWeb, pedidosRouterWeb)
app.use('/productos', protegerWeb, productosRouterWeb)
app.use('/insumos', protegerWeb, insumosRouterWeb)
app.use('/reportes', protegerWeb, reportesRouterWeb)
app.use('/royalties', protegerWeb, royaltiesRouterWeb)

// Rutas API
app.use('/api/login', loginApiRouter)
app.use('/api/actores', protegerApi, actoresRouter)
app.use('/api/pedidos', protegerApi, pedidosRouter)
app.use('/api/productos', protegerApi, productosRouter)
app.use('/api/insumos', protegerApi, insumosRouter)
app.use('/api/royalties', protegerApi, royaltiesRouter)

// 404 API
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Recurso no encontrado' })
})

// 404 Web
app.use((req, res) => {
    res.status(404).render('error', { mensaje: 'Página no encontrada' })
})

export default app
