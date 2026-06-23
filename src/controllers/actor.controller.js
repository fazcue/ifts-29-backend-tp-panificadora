import actorService from '../services/actor.service.js'
import { normalizarError, respuestaError } from '../validators/response.validator.js'
import { obtenerTiposActor } from '../lib/tiposActor.js'

// Bases
const listarActoresBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb
    
    try {
        const actores = await actorService.obtenerActores()

        if (esWeb) {
            const titulo = 'Listado de actores'
		    return res.render('actores/listado', { actores, titulo })
        }

        res.status(200).json(actores)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al listar actores')
        respuestaError(res, resultado, esWeb)
    }
}

const crearActorBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const { nombre, email, password, tipo } = req.body
        const nuevo = await actorService.crearActor(nombre, email, password, tipo)

        if (esWeb) {
            return res.redirect('/actores')
        }

        res.status(201).json(nuevo)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al crear actor')
        respuestaError(res, resultado, esWeb)
    }
}

const actualizarActorBase = async (req, res, opciones) => {
    const esWeb = opciones.esWeb

    try {
        const id = req.params.id
        const { nombre, email, password, tipo, activo } = req.body

        const actor = await actorService.actualizarActor(id, nombre, email, password, tipo, activo)

        if (!actor) {
            if (esWeb) {
                return res.status(404).render('error', { mensaje: 'Actor no encontrado' })
            }

            return res.status(404).json({ error: 'Actor no encontrado' })
        }

        if (esWeb) {
            return res.redirect('/actores')
        }
        
        res.status(200).json(actor)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al actualizar actor')
        respuestaError(res, resultado, esWeb)
    }
}

// Solo API
const listarActorApi = async (req, res) => {
    try {
        const id = req.params.id

        const actor = await actorService.buscarActorPorId(id)

        if (!actor) {
            return res.status(404).json({ error: 'Actor no encontrado' })
        }

        res.status(200).json(actor)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al listar actor')
        respuestaError(res, resultado)
    }
}

const eliminarActorApi = async (req, res) => {
    try {
        const id = req.params.id

        const actor = await actorService.eliminarActor(id)

        if (!actor) {
            return res.status(404).json({ error: 'Actor no encontrado' })
        }
        
        res.status(200).json(actor)
    } catch (error) {
        const resultado = normalizarError(error, 'Error al eliminar actor')
        respuestaError(res, resultado)
    }
}

// Solo web
const renderFormularioNuevoActorWeb = (req, res) => {
    try {
        const tipos = obtenerTiposActor()
        const titulo = 'Alta de nuevo actor'

        res.render('actores/nuevo', { tipos, titulo })
    } catch (error) {
        const resultado = normalizarError(error, 'Error al cargar formulario nuevo actor')
        respuestaError(res, resultado, true)
    }
}

const renderFormularioEditarActorWeb = async (req, res) => {
    try {
        const id = req.params.id

        const actor = await actorService.buscarActorPorId(id)

        if (!actor) {
            return res
                .status(404)
                .render('error', { mensaje: 'Actor no encontrado' })
        }

        const tipos = obtenerTiposActor()
        const titulo = `Editar actor "${actor.nombre}"`

        res.render('actores/editar', { actor, tipos, titulo })
    } catch (error) {
        const resultado = normalizarError(error, 'Error al cargar formulario editar actor')
        respuestaError(res, resultado, true)
    }
}

const cambiarEstadoWeb = async (req, res) => {
    try {
        const id = req.params.id

        const actor = await actorService.cambiarEstadoActor(id)

        if (!actor) {
            return res
                .status(404)
                .render('error', { mensaje: 'Actor no encontrado' })
        }

        res.redirect('/actores')
    } catch (error) {
        const resultado = normalizarError(error, 'Error al cambiar estado')
        respuestaError(res, resultado, true)
    }
}

// Wrappers
const listarActoresApi = (req, res) => {
    return listarActoresBase(req, res, { esWeb: false })
}

const listarActoresWeb = (req, res) => {
    return listarActoresBase(req, res, { esWeb: true })
}

const crearActorApi = (req, res) => {
    return crearActorBase(req, res, { esWeb: false })
}

const crearActorWeb = (req, res) => {
    return crearActorBase(req, res, { esWeb: true })
}

const actualizarActorApi = (req, res) => {
    return actualizarActorBase(req, res, { esWeb: false })
}

const actualizarActorWeb = (req, res) => {
    return actualizarActorBase(req, res, { esWeb: true })
}

export {
    listarActoresApi,
    listarActoresWeb,
    crearActorApi,
    crearActorWeb,
    actualizarActorApi,
    actualizarActorWeb,
    listarActorApi,
    eliminarActorApi,
    renderFormularioNuevoActorWeb,
    renderFormularioEditarActorWeb,
    cambiarEstadoWeb
}
