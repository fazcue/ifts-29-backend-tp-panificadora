import actorService from "../services/actor.service.js"

const validarClaveAltaPlantaWeb = async (req, res, next) => {
    try {
        if (await actorService.existeActorPlanta()) {
            return res.status(409).render('error', { mensaje: 'Ya existe un actor de tipo PLANTA' })
        }

        const claveConfigurada = process.env.CLAVE_ALTA_PLANTA?.trim()

        if (!claveConfigurada) {
            return res.status(500).render('error', { mensaje: 'No está configurada la clave de alta de planta' })
        }

        const claveRecibida = req.body.clave_alta_planta?.trim()

        if (claveRecibida !== claveConfigurada) {
            return res.status(403).render('actores/nuevo', {
                mensaje: 'Clave de alta inválida',
                titulo: 'Alta inicial de planta',
                modoAltaPlanta: true,
                actor: {
                    nombre: req.body.nombre,
                    email: req.body.email,
                },
            })
        }

        req.altaPlantaInicial = true

        next()
    } catch (error) {
        res.status(500).render('error', { mensaje: 'Error validando clave de alta' })
    }
}

export { validarClaveAltaPlantaWeb }
