import express from 'express'

const PUERTO = 3000
const app = express()

app.use(express.json())

app.listen(PUERTO, () => {
    console.log("Servidor corriendo en puerto ", PUERTO)
})
