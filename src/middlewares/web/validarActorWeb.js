import actorService from "../../services/actorService.js"
import { obtenerTiposActor } from "../../lib/tiposActor.js"

const validarActorWeb = async (req, res, next) => {
    try {
        const { nombre, email, password, tipo } = req.body
        const { id } = req.params
        const esAltaPlantaInicial = req.altaPlantaInicial === true

        // data
        const [tipos, actores, actor] = await Promise.all([
            obtenerTiposActor(),
            actorService.obtenerActores(),
            id ? actorService.buscarActorPorId(id) : null
        ])

        const vistaActual = id ? 'actores/editar' : 'actores/nuevo'
        
        // validar ID
        if (id && !actor) {
            return res.status(404).render('error', { mensaje: 'Actor no encontrado' })
        }

        let datosFormulario = {
            actor: {
                nombre,
                email,
                tipo
            },
            tipos
        }

        if (esAltaPlantaInicial) {
            datosFormulario = {
                ...datosFormulario,
                modoAltaPlanta: true,
                titulo: 'Alta inicial de planta',
                claveAltaPlanta: req.body.clave_alta_planta,
                formAction: '/alta-planta',
                cancelarHref: '/'
            }
        }

        if (id) {
            datosFormulario.actor.id = actor.id
            datosFormulario.actor.activo = actor.activo
        }

        // validar campos vacíos
        if (!nombre?.trim() || !email?.trim() || !tipo?.trim() || (!id && !password?.trim())) {
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
            return actor.id !== id && actor.nombre.trim().toLowerCase() === nombre.trim().toLowerCase()
        })

        if (existeActor) {
            return res.status(409).render(vistaActual, { error: `Ya existe un actor con el nombre ${nombre}`, ...datosFormulario })
        }

        // validar email duplicado
        const existeEmail = actores.some(actor => {
            return actor.id !== id && actor.email?.trim().toLowerCase() === emailNormalizado
        })

        if (existeEmail) {
            return res.status(409).render(vistaActual, { error: `Ya existe un actor con el email ${email}`, ...datosFormulario })
        }

        next()
    } catch (err) {
        res.status(500).render('error', { mensaje: 'Error validando actor' })
    }
}

export { validarActorWeb }
