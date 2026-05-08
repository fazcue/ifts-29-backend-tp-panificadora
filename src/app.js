import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PUERTO = 3000
const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

// Vistas Pug
app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))

app.get('/', (req, res) => res.render('portada'))

// Servidor
app.listen(PUERTO, () => {
    console.log("Servidor corriendo en puerto ", PUERTO)
})
