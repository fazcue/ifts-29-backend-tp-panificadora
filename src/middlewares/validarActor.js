import { leerData } from "../lib/fs.js"

async function validarActor(req, res, next) {
    try {
        const { nombre, tipo, activo } = req.body
        const { id } = req.params

        const tipos = await leerData("actor_tipo")
        const actores = await leerData("actores")

        // validar ID
        if (id && !actores.some(actor => actor.id === +id)) {
            return res.status(404).json({ error: 'Actor no encontrado' })
        }

        // validar campos vacíos
        if (!nombre?.trim() || !tipo?.trim()) {
            return res.status(400).json({ error: `Datos faltantes` })
        }

        // validar tipo
        if (!tipos.includes(tipo.trim())) {
            return res.status(400).json({
                error: `Tipo inválido. Opciones: ${tipos.join(', ')}`
            })
        }

        // validar nombre duplicado
        const existeActor = actores.some(actor => {
            return actor.id !== +id && actor.nombre.trim().toLowerCase() === nombre.trim().toLowerCase()
        })

        if (existeActor) {
            return res.status(409).json({ error: `Ya existe un actor con el nombre ${nombre}` })
        }

        // validar activo
        if (activo !== undefined && typeof activo !== 'boolean') {
            return res.status(400).json({ error: 'El campo activo debe ser booleano' })
        }

        next()
    } catch (err) {
        res.status(500).json({ error: 'Error validando actor' })
    }
}

export default validarActor
