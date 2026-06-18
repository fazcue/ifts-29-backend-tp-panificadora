import responseValidator from '../../validators/response.validator.js'
import insumoValidator from '../../validators/insumo.validator.js'

const validarInsumo = async (req, res, next) => {
    try {
        const { id } = req.params
        const { nombre, unidad, balance } = req.body

        if (id) {
            const resultadoInsumo = await insumoValidator.validarInsumo(id)

            if (!resultadoInsumo.ok) {
                return responseValidator.respuestaError(res, resultadoInsumo)
            }
        }

        // nombre
        const resultadoNombre = insumoValidator.validarNombre(nombre)

        if (!resultadoNombre.ok) {
            return responseValidator.respuestaError(res, resultadoNombre)
        }

        // nombre único
        const resultadoNombreUnico = await insumoValidator.validarNombreUnico(resultadoNombre.valor, id ?? null)

        if (!resultadoNombreUnico.ok) {
            return responseValidator.respuestaError(res, resultadoNombreUnico)
        }

        // unidad
        const resultadoUnidad = insumoValidator.validarUnidad(unidad)

        if (!resultadoUnidad.ok) {
            return responseValidator.respuestaError(res, resultadoUnidad)
        }

        // balance
        const resultadoBalance = insumoValidator.validarBalance(balance)

        if (!resultadoBalance.ok) {
            return responseValidator.respuestaError(res, resultadoBalance)
        }

        // datos normalizados
        req.body.nombre = resultadoNombre.valor
        req.body.unidad = resultadoUnidad.valor
        req.body.balance = resultadoBalance.valor

        next()
    } catch (err) {
        return res.status(500).json({ mensaje: 'Error validando insumo' })
    }
}

export default validarInsumo
