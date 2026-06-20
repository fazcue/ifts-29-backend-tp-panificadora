import productoValidator from '../validators/producto.validator.js'
import { respuestaError } from '../validators/response.validator.js'

const VISTA_CREAR = 'productos/nuevo'
const VISTA_ACTUALIZAR = 'productos/editar'

const validarProductoBase = async (req, res, next, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const { id } = req.params
        const { nombre, precio } = req.body

        const vistaActual = id ? VISTA_ACTUALIZAR : VISTA_CREAR
        let productoActual = null

        if (id) {
            // producto
            const resultadoProducto = await productoValidator.validarProducto(id)

            if (!resultadoProducto.ok) {
                return respuestaError(res, resultadoProducto, esWeb)
            }

            productoActual = resultadoProducto.valor
        }

        // datos formulario (web) para re-render
        let datosFormulario = {}

        if (esWeb) {
            datosFormulario = {
                producto: {
                    id: productoActual?.id,
                    activo: productoActual?.activo,
                    nombre,
                    precio,
                }
            }
        }

        // nombre
        const resultadoNombre = productoValidator.validarNombre(nombre)

        if (!resultadoNombre.ok) {
            return respuestaError(res, resultadoNombre, esWeb, vistaActual, datosFormulario)
        }

        // nombre único
        const resultadoNombreUnico = await productoValidator.validarNombreUnico(resultadoNombre.valor, id ?? null)

        if (!resultadoNombreUnico.ok) {
            return respuestaError(res, resultadoNombreUnico, esWeb, vistaActual, datosFormulario)
        }

        // precio
        const resultadoPrecio = productoValidator.validarPrecio(precio)

        if (!resultadoPrecio.ok) {
            return respuestaError(res, resultadoPrecio, esWeb, vistaActual, datosFormulario)
        }

        // activo (solo API)
        if (!esWeb) {
            const { activo } = req.body

            const resultadoActivo = productoValidator.validarActivo(activo)

            if (!resultadoActivo.ok) {
                return respuestaError(res, resultadoActivo)
            }

            if (activo !== undefined) {
                req.body.activo = resultadoActivo.valor
            }
        }

        // entrega de datos normalizados
        req.body.nombre = resultadoNombre.valor
        req.body.precio = resultadoPrecio.valor

        next()
    } catch (err) {
        const respuesta = { estado: 500, mensaje: 'Error validando producto' }
        return respuestaError(res, respuesta, esWeb)
    }
}

const validarProductoApi = (req, res, next) => {
    return validarProductoBase(req, res, next, { esWeb: false })
}

const validarProductoWeb = (req, res, next) => {
    return validarProductoBase(req, res, next, { esWeb: true })
}

export { validarProductoApi, validarProductoWeb }
