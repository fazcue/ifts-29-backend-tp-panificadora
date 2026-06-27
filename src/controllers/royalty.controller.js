import royaltyService from '../services/royalty.service.js'
import actorService from '../services/actor.service.js'
import { TIPOS_ACTOR } from '../lib/tiposActor.js'
import { normalizarError, respuestaError } from '../validators/response.validator.js'

// Bases
const listarRoyaltiesBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const filtro = {}

        if (req.query.periodo) {
            filtro.periodo = req.query.periodo
        }

        if (req.query.estado) {
            filtro.estado = req.query.estado
        }

        if (req.query.id_actor) {
            filtro.actor = req.query.id_actor
        }

        const royalties = await royaltyService.obtenerRoyalties(filtro)

        if (esWeb) {
            const titulo = 'Royalties'
            const periodos = await royaltyService.obtenerPeriodosConDatos()
            const franquicias = await actorService.obtenerActoresPorTipo(TIPOS_ACTOR.FRANQUICIA)

            return res.render('royalties/listado', { royalties, titulo, periodos, franquicias, filtro: req.query })
        }

        res.status(200).json(royalties)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al listar royalties')
        respuestaError(res, resultado, esWeb)
    }
}

const calcularRoyaltyBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const { id_actor, periodo } = req.body

        if (!id_actor || !periodo) {
            const resultado = { estado: 400, mensaje: 'Actor y período son obligatorios' }
            return respuestaError(res, resultado, esWeb)
        }

        const royalty = await royaltyService.calcularRoyalty(id_actor, periodo)

        if (!royalty) {
            const resultado = { estado: 404, mensaje: 'Actor no encontrado' }
            return respuestaError(res, resultado, esWeb)
        }

        if (esWeb) {
            return res.redirect('/royalties')
        }

        res.status(200).json(royalty)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al calcular royalty')
        respuestaError(res, resultado, esWeb)
    }
}

const cambiarEstadoRoyaltyBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const id = req.params.id
        const { estado } = req.body

        if (!estado) {
            const resultado = { estado: 400, mensaje: 'El estado es obligatorio' }
            return respuestaError(res, resultado, esWeb)
        }

        const royalty = await royaltyService.cambiarEstadoRoyalty(id, estado)

        if (!royalty) {
            const resultado = { estado: 404, mensaje: 'Royalty no encontrado' }
            return respuestaError(res, resultado, esWeb)
        }

        if (esWeb) {
            return res.redirect('/royalties')
        }

        res.status(200).json(royalty)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al cambiar estado del royalty')
        respuestaError(res, resultado, esWeb)
    }
}

// Solo web
const renderFormularioCalcularWeb = async (req, res) => {
    try {
        const franquicias = await actorService.obtenerActoresPorTipo(TIPOS_ACTOR.FRANQUICIA)
        const periodos = await royaltyService.obtenerPeriodosConDatos()
        const titulo = 'Calcular royalty'

        res.render('royalties/calcular', { franquicias, periodos, titulo })
    } catch (error) {
        const resultado = normalizarError(error, 'Error al cargar formulario')
        respuestaError(res, resultado, true)
    }
}

// Wrappers
const listarRoyaltiesApi = (req, res) => {
    return listarRoyaltiesBase(req, res, { esWeb: false })
}

const listarRoyaltiesWeb = (req, res) => {
    return listarRoyaltiesBase(req, res, { esWeb: true })
}

const calcularRoyaltyApi = (req, res) => {
    return calcularRoyaltyBase(req, res, { esWeb: false })
}

const calcularRoyaltyWeb = (req, res) => {
    return calcularRoyaltyBase(req, res, { esWeb: true })
}

const cambiarEstadoRoyaltyApi = (req, res) => {
    return cambiarEstadoRoyaltyBase(req, res, { esWeb: false })
}

const cambiarEstadoRoyaltyWeb = (req, res) => {
    return cambiarEstadoRoyaltyBase(req, res, { esWeb: true })
}

export {
    listarRoyaltiesApi,
    listarRoyaltiesWeb,
    calcularRoyaltyApi,
    calcularRoyaltyWeb,
    renderFormularioCalcularWeb,
    cambiarEstadoRoyaltyApi,
    cambiarEstadoRoyaltyWeb,
}
