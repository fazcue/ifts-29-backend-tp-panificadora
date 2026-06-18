import insumoValidator from '../../validators/insumo.validator.js'
import responseValidator from '../../validators/response.validator.js'

const VISTA_CREAR_INSUMO = 'insumos/nuevo'
const VISTA_ACTUALIZAR_INSUMO = 'insumos/editar'

const datosFormulario = (nombre, unidad, balance, insumoActual = null) => {
    return {
        insumo: {
            id: insumoActual?.id,
            activo: insumoActual?.activo,
            nombre,
            unidad,
            balance,
        },
    }
}

const validarInsumoWeb = async (req, res, next) => {
    try {
        const { id } = req.params
        const { nombre, unidad, balance } = req.body

        const vistaActual = id ? VISTA_ACTUALIZAR_INSUMO : VISTA_CREAR_INSUMO
        let insumoActual = null

        if (id) {
            const resultadoInsumo = await insumoValidator.validarInsumo(id)

            if (!resultadoInsumo.ok) {
                return res.status(resultadoInsumo.estado).render('error', { mensaje: resultadoInsumo.mensaje })
            }

            insumoActual = resultadoInsumo.valor
        }

        const datos = datosFormulario(nombre, unidad, balance, insumoActual)

        // nombre
        const resultadoNombre = insumoValidator.validarNombre(nombre)

        if (!resultadoNombre.ok) {
            return responseValidator.respuestaErrorWeb(res, vistaActual, resultadoNombre, datos)
        }

        // nombre único
        const resultadoNombreUnico = await insumoValidator.validarNombreUnico(resultadoNombre.valor, id ?? null)

        if (!resultadoNombreUnico.ok) {
            return responseValidator.respuestaErrorWeb(res, vistaActual, resultadoNombreUnico, datos)
        }

        // unidad
        const resultadoUnidad = insumoValidator.validarUnidad(unidad)

        if (!resultadoUnidad.ok) {
            return responseValidator.respuestaErrorWeb(res, vistaActual, resultadoUnidad, datos)
        }

        // balance
        const resultadoBalance = insumoValidator.validarBalance(balance)

        if (!resultadoBalance.ok) {
            return responseValidator.respuestaErrorWeb(res, vistaActual, resultadoBalance, datos)
        }

        // datos normalizados
        req.body.nombre = resultadoNombre.valor
        req.body.unidad = resultadoUnidad.valor
        req.body.balance = resultadoBalance.valor

        next()
    } catch (err) {
        return res.status(500).render('error', { mensaje: 'Error validando insumo' })
    }
}

export default validarInsumoWeb
