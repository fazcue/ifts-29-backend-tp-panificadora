import insumoService from '../services/insumo.service.js'
import { normalizarError, respuestaError } from '../validators/response.validator.js'

// Bases
const listarInsumosBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const insumos = await insumoService.obtenerInsumos()

        if (esWeb) {
            const titulo = 'Listado de insumos'
            return res.render('insumos/listado', { insumos, titulo })
        }

        res.status(200).json(insumos)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al listar insumos')
        respuestaError(res, resultado, esWeb)
    }
}

const crearInsumoBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const { nombre, unidad, balance } = req.body
        const nuevo = await insumoService.crearInsumo(nombre, unidad, balance)

        if (esWeb) {
            return res.redirect('/insumos')
        }

        res.status(201).json(nuevo)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al crear insumo')
        respuestaError(res, resultado, esWeb)
    }
}

const actualizarInsumoBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const id = req.params.id
        const { nombre, unidad, balance } = req.body

        const insumo = await insumoService.actualizarInsumo(id, nombre, unidad, balance)

        if (!insumo) {
            if (esWeb) {
                return res.status(404).render('error', { mensaje: 'Insumo no encontrado' })
            }

            return res.status(404).json({ error: 'Insumo no encontrado' })
        }

        if (esWeb) {
            return res.redirect('/insumos')
        }

        res.status(200).json(insumo)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al actualizar insumo')
        respuestaError(res, resultado, esWeb)
    }
}

const eliminarInsumoBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const id = req.params.id

        const insumo = await insumoService.eliminarInsumo(id)

        if (!insumo) {
            if (esWeb) {
                return res.status(404).render('error', { mensaje: 'Insumo no encontrado' })
            }

            return res.status(404).json({ error: 'Insumo no encontrado' })
        }

        if (esWeb) {
            return res.redirect('/insumos')
        }

        res.status(200).json(insumo)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al eliminar insumo')
        respuestaError(res, resultado, esWeb)
    }
}

// Solo API
const listarInsumoApi = async (req, res) => {
    try {
        const id = req.params.id

        const insumo = await insumoService.buscarInsumoPorId(id)

        if (!insumo) {
            return res.status(404).json({ error: 'Insumo no encontrado' })
        }

        res.status(200).json(insumo)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al listar insumo')
        respuestaError(res, resultado)
    }
}

// Solo web
const renderFormularioNuevoInsumoWeb = async (req, res) => {
    try {
        const titulo = 'Alta de nuevo insumo'

        res.render('insumos/nuevo', { titulo })
    } catch (error) {
        const resultado = normalizarError(error, 'Error al cargar formulario nuevo insumo')
        respuestaError(res, resultado, true)
    }
}

const renderFormularioEditarInsumoWeb = async (req, res) => {
    try {
        const id = req.params.id

        const insumo = await insumoService.buscarInsumoPorId(id)

        if (!insumo) {
            return res
                .status(404)
                .render('error', { mensaje: 'Insumo no encontrado' })
        }

        const titulo = `Editar insumo "${insumo.nombre}"`

        res.render('insumos/editar', { insumo, titulo })
    } catch (error) {
        const resultado = normalizarError(error, 'Error al cargar formulario editar insumo')
        respuestaError(res, resultado, true)
    }
}

const cambiarEstadoInsumoWeb = async (req, res) => {
    try {
        const id = req.params.id

        const insumo = await insumoService.cambiarEstadoInsumo(id)

        if (!insumo) {
            return res
                .status(404)
                .render('error', { mensaje: 'Insumo no encontrado' })
        }

        res.redirect('/insumos')
    } catch (error) {
        const resultado = normalizarError(error, 'Error al cambiar estado')
        respuestaError(res, resultado, true)
    }
}

// Wrappers
const listarInsumosApi = (req, res) => {
    return listarInsumosBase(req, res, { esWeb: false })
}

const listarInsumosWeb = (req, res) => {
    return listarInsumosBase(req, res, { esWeb: true })
}

const crearInsumoApi = (req, res) => {
    return crearInsumoBase(req, res, { esWeb: false })
}

const crearInsumoWeb = (req, res) => {
    return crearInsumoBase(req, res, { esWeb: true })
}

const actualizarInsumoApi = (req, res) => {
    return actualizarInsumoBase(req, res, { esWeb: false })
}

const actualizarInsumoWeb = (req, res) => {
    return actualizarInsumoBase(req, res, { esWeb: true })
}

const eliminarInsumoApi = (req, res) => {
    return eliminarInsumoBase(req, res, { esWeb: false })
}

const eliminarInsumoWeb = (req, res) => {
    return eliminarInsumoBase(req, res, { esWeb: true })
}

export {
    listarInsumosApi,
    listarInsumosWeb,
    listarInsumoApi,
    crearInsumoApi,
    crearInsumoWeb,
    actualizarInsumoApi,
    actualizarInsumoWeb,
    eliminarInsumoApi,
    eliminarInsumoWeb,
    renderFormularioNuevoInsumoWeb,
    renderFormularioEditarInsumoWeb,
    cambiarEstadoInsumoWeb,
}
