import actorService from "../../services/actorService.js"

const validarActor = async (req, res, next) => {
    try {
        const { nombre, email, password, tipo, activo } = req.body
        const { id } = req.params

        // data
        const [tipos, actores] = await Promise.all([
            actorService.obtenerTipos(),
            actorService.obtenerActores()
        ])

        // validar ID
        if (id && !actores.some(actor => actor.id === id)) {
            return res.status(404).json({ error: 'Actor no encontrado' })
        }

        // validar campos vacíos
        if (!nombre?.trim() || !email?.trim() || !tipo?.trim() || (!id && !password?.trim())) {
            return res.status(400).json({ error: `Datos faltantes` })
        }

        // validar email
        const emailNormalizado = email.trim().toLowerCase()
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)

        if (!emailValido) {
            return res.status(400).json({ error: 'Email inválido' })
        }

        // validar tipo
        if (!tipos.includes(tipo.trim())) {
            return res.status(400).json({
                error: `Tipo inválido. Opciones: ${tipos.join(', ')}`
            })
        }

        // validar nombre duplicado
        const existeActor = actores.some(actor => {
            return actor.id !== id && actor.nombre.trim().toLowerCase() === nombre.trim().toLowerCase()
        })

        if (existeActor) {
            return res.status(409).json({ error: `Ya existe un actor con el nombre ${nombre}` })
        }

        // validar email duplicado
        const existeEmail = actores.some(actor => {
            return actor.id !== id && actor.email?.trim().toLowerCase() === emailNormalizado
        })

        if (existeEmail) {
            return res.status(409).json({ error: `Ya existe un actor con el email ${email}` })
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
