import { respuestaError } from '../validators/response.validator.js'
import insumoValidator from '../validators/insumo.validator.js'

const VISTA_CREAR = 'insumos/nuevo'
const VISTA_ACTUALIZAR = 'insumos/editar'

const validarInsumoBase = async (req, res, next, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const { id } = req.params
        const { nombre, unidad, balance } = req.body

        const vistaActual = id ? VISTA_ACTUALIZAR : VISTA_CREAR
        let insumoActual = null

        if (id) {
            const resultadoInsumo = await insumoValidator.validarInsumo(id)

            if (!resultadoInsumo.ok) {
                return respuestaError(res, resultadoInsumo, esWeb)
            }

            insumoActual = resultadoInsumo.valor
        }

        // datos formulario (web) para re-render
        let datosFormulario = {}

        if (esWeb) {
            datosFormulario = {
                insumo: {
                    id: insumoActual?.id,
                    activo: insumoActual?.activo,
                    nombre,
                    unidad,
                    balance,
                },
            }
        }

        // nombre
        const resultadoNombre = insumoValidator.validarNombre(nombre)

        if (!resultadoNombre.ok) {
            return respuestaError(res, resultadoNombre, esWeb, vistaActual, datosFormulario)
        }

        // nombre único
        const resultadoNombreUnico = await insumoValidator.validarNombreUnico(resultadoNombre.valor, id ?? null)

        if (!resultadoNombreUnico.ok) {
            return respuestaError(res, resultadoNombreUnico, esWeb, vistaActual, datosFormulario)
        }

        // unidad
        const resultadoUnidad = insumoValidator.validarUnidad(unidad)

        if (!resultadoUnidad.ok) {
            return respuestaError(res, resultadoUnidad, esWeb, vistaActual, datosFormulario)
        }

        // balance
        const resultadoBalance = insumoValidator.validarBalance(balance)

        if (!resultadoBalance.ok) {
            return respuestaError(res, resultadoBalance, esWeb, vistaActual, datosFormulario)
        }

        // datos normalizados
        req.body.nombre = resultadoNombre.valor
        req.body.unidad = resultadoUnidad.valor
        req.body.balance = resultadoBalance.valor

        next()
    } catch (err) {
        const respuesta = { estado: 500, mensaje: 'Error validando insumo' }
        return respuestaError(res, respuesta, esWeb)
    }
}

const validarInsumoApi = (req, res, next) => {
    return validarInsumoBase(req, res, next, { esWeb: false })
}

const validarInsumoWeb = (req, res, next) => {
    return validarInsumoBase(req, res, next, { esWeb: true })
}

export { validarInsumoApi, validarInsumoWeb }
