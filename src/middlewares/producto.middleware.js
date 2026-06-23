import productoValidator from '../validators/producto.validator.js'
import recetaValidator from '../validators/receta.validator.js'
import recetaService from '../services/receta.service.js'
import insumoService from '../services/insumo.service.js'
import { respuestaError } from '../validators/response.validator.js'

const VISTA_CREAR = 'productos/nuevo'
const VISTA_ACTUALIZAR = 'productos/editar'

const prepararInsumosFormulario = (insumosActivos, insumosReceta = []) => {
    return insumosActivos.map((insumo) => {
        const recetaInsumo = insumosReceta.find(
            (item) => String(item.insumo?._id || item.insumo) === String(insumo.id),
        )

        return {
            ...insumo.toObject(),
            id: insumo.id,
            cantidad_necesaria: recetaInsumo?.cantidad_necesaria || '',
        }
    })
}

const validarProductoBase = async (req, res, next, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const { id } = req.params
        const { nombre, precio, insumos } = req.body

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

        // insumos existentes (receta actual del producto, si es edición)
        const recetaActual = id ? await recetaService.obtenerInsumosPorProducto(id) : []

        // datos formulario (web) para re-render
        let datosFormulario = {}

        if (esWeb) {
            const insumosActivos = await insumoService.obtenerInsumosActivos()

            // Insumos de la receta actual (ya poblados, incluye inactivos)
            const insumosDeLaReceta = recetaActual
                .filter(item => item.insumo)
                .map(item => ({
                    ...item.insumo.toObject(),
                    id: item.insumo.id,
                    cantidad_necesaria: item.cantidad_necesaria,
                }))

            // IDs de insumos ya en la receta
            const idsInsumosReceta = new Set(insumosDeLaReceta.map(i => i.id))

            // Activos que NO están en la receta (para poder agregarlos nuevos)
            const insumosActivosNoIncluidos = insumosActivos
                .filter(i => !idsInsumosReceta.has(i.id))
                .map(i => ({
                    ...i.toObject(),
                    id: i.id,
                    cantidad_necesaria: '',
                }))

            // Combinar
            const insumosFormulario = [...insumosDeLaReceta, ...insumosActivosNoIncluidos]

            datosFormulario = {
                producto: {
                    id: productoActual?.id,
                    activo: productoActual?.activo,
                    nombre,
                    precio,
                },
                insumos: insumosFormulario,
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

        // insumos (receta)
        const resultadoInsumos = await recetaValidator.validarInsumos(insumos, recetaActual)

        if (!resultadoInsumos.ok) {
            return respuestaError(res, resultadoInsumos, esWeb, vistaActual, datosFormulario)
        }

        // entrega de datos normalizados
        req.body.nombre = resultadoNombre.valor
        req.body.precio = resultadoPrecio.valor
        req.body.insumos = resultadoInsumos.valor

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
