import responseValidator from '../../validators/response.validator.js'
import productoValidator from '../../validators/producto.validator.js'

const validarProducto = async (req, res, next) => {
    try {
        const { id } = req.params
        const { nombre, precio, activo } = req.body

        if (id) {
            // producto
            const resultadoProducto = await productoValidator.validarProducto(id)

            if (!resultadoProducto.ok) {
                return responseValidator.respuestaError(res, resultadoProducto)
            }
        }

        // nombre
        const resultadoNombre = productoValidator.validarNombre(nombre)

        if (!resultadoNombre.ok) {
            return responseValidator.respuestaError(res, resultadoNombre)
        }

        // nombre único
        const resultadoNombreUnico = await productoValidator.validarNombreUnico(resultadoNombre.valor, id ?? null)

        if (!resultadoNombreUnico.ok) {
            return responseValidator.respuestaError(res, resultadoNombreUnico)
        }

        // precio
        const resultadoPrecio = productoValidator.validarPrecio(precio)

        if (!resultadoPrecio.ok) {
            return responseValidator.respuestaError(res, resultadoPrecio)
        }

        // activo
        const resultadoActivo = productoValidator.validarActivo(activo)

        if (!resultadoActivo.ok) {
            return responseValidator.respuestaError(res, resultadoActivo)
        }

        // entrega de datos normalizados
        req.body.nombre = resultadoNombre.valor
        req.body.precio = resultadoPrecio.valor

        if (activo !== undefined) {
            req.body.activo = resultadoActivo.valor
        }

        next()
    } catch (err) {
        return res.status(500).json({ mensaje: 'Error validando producto' })
    }
}

export default validarProducto
