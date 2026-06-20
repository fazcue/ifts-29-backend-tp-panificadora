import actorValidator from '../validators/actor.validator.js'
import { respuestaError } from '../validators/response.validator.js'
import { TIPOS_ACTOR, obtenerTiposActor } from '../lib/tiposActor.js'

const VISTA_CREAR = 'actores/nuevo'
const VISTA_ACTUALIZAR = 'actores/editar'

const validarActorBase = async (req, res, next, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const { id } = req.params
        const { nombre, email, password } = req.body
        let { tipo } = req.body
        const esAltaPlantaInicial = req.altaPlantaInicial === true

        if (esAltaPlantaInicial) {
            tipo = TIPOS_ACTOR.PLANTA
            req.body.tipo = tipo
        }

        const vistaActual = id ? VISTA_ACTUALIZAR : VISTA_CREAR
        let actorActual = null

        if (id) {
            const resultadoActor = await actorValidator.validarActor(id)

            if (!resultadoActor.ok) {
                return respuestaError(res, resultadoActor, esWeb)
            }

            actorActual = resultadoActor.valor
        }

        // datos formulario (web) para re-render
        let datosFormulario = {}

        if (esWeb) {
            datosFormulario = {
                actor: {
                    id: actorActual?.id,
                    activo: actorActual?.activo,
                    nombre,
                    email,
                    tipo,
                },
                tipos: obtenerTiposActor(),
            }

            if (esAltaPlantaInicial) {
                datosFormulario = {
                    ...datosFormulario,
                    modoAltaPlanta: true,
                    titulo: 'Alta inicial de planta',
                }
            }
        }

        // nombre
        const resultadoNombre = actorValidator.validarNombre(nombre)

        if (!resultadoNombre.ok) {
            return respuestaError(res, resultadoNombre, esWeb, vistaActual, datosFormulario)
        }

        // nombre único
        const resultadoNombreUnico = await actorValidator.validarNombreUnico(resultadoNombre.valor, id ?? null)

        if (!resultadoNombreUnico.ok) {
            return respuestaError(res, resultadoNombreUnico, esWeb, vistaActual, datosFormulario)
        }

        // email
        const resultadoEmail = actorValidator.validarEmail(email)

        if (!resultadoEmail.ok) {
            return respuestaError(res, resultadoEmail, esWeb, vistaActual, datosFormulario)
        }

        // email único
        const resultadoEmailUnico = await actorValidator.validarEmailUnico(resultadoEmail.valor, id ?? null)

        if (!resultadoEmailUnico.ok) {
            return respuestaError(res, resultadoEmailUnico, esWeb, vistaActual, datosFormulario)
        }

        // tipo
        const resultadoTipo = actorValidator.validarTipo(tipo)

        if (!resultadoTipo.ok) {
            return respuestaError(res, resultadoTipo, esWeb, vistaActual, datosFormulario)
        }

        // password (obligatoria al crear; opcional al actualizar)
        if (!id) {
            const resultadoPassword = actorValidator.validarPassword(password)

            if (!resultadoPassword.ok) {
                return respuestaError(res, resultadoPassword, esWeb, vistaActual, datosFormulario)
            }

            req.body.password = resultadoPassword.valor
        } else if (password?.trim()) {
            const resultadoPassword = actorValidator.validarPassword(password)

            if (!resultadoPassword.ok) {
                return respuestaError(res, resultadoPassword, esWeb, vistaActual, datosFormulario)
            }

            req.body.password = resultadoPassword.valor
        }

        // activo (solo API)
        if (!esWeb) {
            const { activo } = req.body

            const resultadoActivo = actorValidator.validarActivo(activo)

            if (!resultadoActivo.ok) {
                return respuestaError(res, resultadoActivo)
            }

            if (activo !== undefined) {
                req.body.activo = resultadoActivo.valor
            }
        }

        // datos normalizados
        req.body.nombre = resultadoNombre.valor
        req.body.email = resultadoEmail.valor
        req.body.tipo = resultadoTipo.valor

        next()
    } catch (err) {
        const respuesta = { estado: 500, mensaje: 'Error validando actor' }
        return respuestaError(res, respuesta, esWeb)
    }
}

const validarActorApi = (req, res, next) => {
    return validarActorBase(req, res, next, { esWeb: false })
}

const validarActorWeb = (req, res, next) => {
    return validarActorBase(req, res, next, { esWeb: true })
}

export { validarActorApi, validarActorWeb }
