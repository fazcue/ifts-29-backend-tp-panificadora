import { leerData } from "../lib/fs.js"

async function validarActorWeb(req, res, next) {
    try {
        const { nombre, email, tipo } = req.body
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
            ? { actor: { ...actor, nombre, email, tipo }, tipos }
            : { actor: { nombre, email, tipo }, tipos }

        // validar campos vacíos
        if (!nombre?.trim() || !email?.trim() || !tipo?.trim()) {
            return res.status(400).render(vistaActual, { error: 'Datos faltantes', ...datosFormulario })
        }

        // validar email
        const emailNormalizado = email.trim().toLowerCase()
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)

        if (!emailValido) {
            return res.status(400).render(vistaActual, { error: 'Email inválido', ...datosFormulario })
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

        // validar email duplicado
        const existeEmail = actores.some(actor => {
            return actor.id !== +id && actor.email?.trim().toLowerCase() === emailNormalizado
        })

        if (existeEmail) {
            return res.status(409).render(vistaActual, { error: `Ya existe un actor con el email ${email}`, ...datosFormulario })
        }

        next()
    } catch (err) {
        res.status(500).render('error', { mensaje: 'Error validando actor' })
    }
}

export default validarActorWeb
