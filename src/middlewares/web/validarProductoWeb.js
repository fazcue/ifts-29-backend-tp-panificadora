import productoValidator from "../../validators/producto.validator.js"
import responseValidator from "../../validators/response.validator.js"

const VISTA_CREAR_PRODUCTO = "productos/nuevo"
const VISTA_ACTUALIZAR_PRODUCTO = "productos/editar"

const datosFormulario = (nombre, precio, productoActual = null) => {
    return {
        producto: {
            id: productoActual?.id,
            activo: productoActual?.activo,
            nombre,
            precio,
        },
    }
}

const validarProductoWeb = async (req, res, next) => {
    try {
        const { id } = req.params
        const { nombre, precio } = req.body

        const vistaActual = id ? VISTA_ACTUALIZAR_PRODUCTO : VISTA_CREAR_PRODUCTO
        let productoActual = null

        if (id) {
            // producto
            const resultadoProducto = await productoValidator.validarProducto(id)

            if (!resultadoProducto.ok) {
                return res.status(resultadoProducto.estado).render("error", { mensaje: resultadoProducto.mensaje })
            }

            productoActual = resultadoProducto.valor
        }

        // datos formulario (necesario para el render)
        const datos = datosFormulario(nombre, precio, productoActual)

        // nombre
        const resultadoNombre = productoValidator.validarNombre(nombre)

        if (!resultadoNombre.ok) {
            return responseValidator.respuestaErrorWeb(res, vistaActual, resultadoNombre, datos)
        }

        // nombre unico
        const resultadoNombreUnico = await productoValidator.validarNombreUnico(resultadoNombre.valor, id ?? null)

        if (!resultadoNombreUnico.ok) {
            return responseValidator.respuestaErrorWeb(res, vistaActual, resultadoNombreUnico, datos)
        }

        // precio
        const resultadoPrecio = productoValidator.validarPrecio(precio)

        if (!resultadoPrecio.ok) {
            return responseValidator.respuestaErrorWeb(res, vistaActual, resultadoPrecio, datos)
        }

        // entrega de datos normalizados
        req.body.nombre = resultadoNombre.valor
        req.body.precio = resultadoPrecio.valor

        next()
    } catch (err) {
        return res.status(500).render("error", { mensaje: "Error validando producto" })
    }
}

export default validarProductoWeb
