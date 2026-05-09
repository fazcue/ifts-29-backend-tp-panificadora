import { leerData } from "../lib/fs.js"

async function validarActorWeb(req, res, next) {
    try {
        const { nombre, tipo } = req.body
        const { id } = req.params

        const tipos = await leerData("actor_tipo")
        const actores = await leerData("actores")

        const vistaActual = id ? 'actores/editar' : 'actores/nuevo'

        const actor = id ? actores.find(actor => actor.id === +id) : null

        // validar ID
        if (id && !actor) {
            return res.status(404).render('error', { mensaje: 'Actor no encontrado' })
        }

        const datosFormulario = id
            ? { actor: { ...actor, nombre, tipo }, tipos }
            : { actor: { nombre, tipo }, tipos }

        // validar campos vacíos
        if (!nombre?.trim() || !tipo?.trim()) {
            return res.status(400).render(vistaActual, { error: 'Datos faltantes', ...datosFormulario })
        }

        // validar tipo
        if (!tipos.includes(tipo.trim())) {
            return res.status(400).render(vistaActual, { error: `Tipo inválido. Opciones: ${tipos.join(', ')}`, ...datosFormulario })
        }

        // validar nombre duplicado
        const existeActor = actores.some(actor => {
            return actor.id !== +id && actor.nombre.trim().toLowerCase() === nombre.trim().toLowerCase()
        })

        if (existeActor) {
            return res.status(409).render(vistaActual, { error: `Ya existe un actor con el nombre ${nombre}`, ...datosFormulario })
        }

        next()
    } catch (err) {
        res.status(500).render('error', { mensaje: 'Error validando actor' })
    }
}

export default validarActorWeb
