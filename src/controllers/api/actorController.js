import actorService from '../../services/actorService.js'
import { responderErrorApi } from '../../lib/errorResponses.js'

const listarActores = async (req, res) => {
    try {
        const actores = await actorService.obtenerActores()

        res.status(200).json(actores)
    } catch (error) {
        responderErrorApi(res, error, 'Error al listar actores')
    }
}

const listarActor = async (req, res) => {
    try {
        const id = req.params.id

        const actor = await actorService.buscarActorPorId(id)

        if (!actor) {
            return res.status(404).json({ error: 'Actor no encontrado' })
        }

        res.status(200).json(actor)
    } catch (error) {
        responderErrorApi(res, error, 'Error al listar actor')
    }
}

const crearActor = async (req, res) => {
    try {
        const { nombre, email, password, tipo } = req.body
        
        const nuevo = await actorService.crearActor(nombre, email, password, tipo)

        res.status(201).json(nuevo)
    } catch (error) {
        responderErrorApi(res, error, 'Error al crear actor')
    }
}

const actualizarActor = async (req, res) => {
    try {
        const id = req.params.id
        const { nombre, email, password, tipo, activo } = req.body

        const actor = await actorService.actualizarActor(id, nombre, email, password, tipo, activo)

        if (!actor) {
            return res.status(404).json({ error: 'Actor no encontrado' })
        }
        
        res.status(200).json(actor)
    } catch (error) {
        responderErrorApi(res, error, 'Error al actualizar actor')
    }
}

const eliminarActor = async (req, res) => {
    try {
        const id = req.params.id

        const actor = await actorService.eliminarActor(id)

        if (!actor) {
            return res.status(404).json({ error: 'Actor no encontrado' })
        }
        
        res.status(200).json(actor)
    } catch (error) {
        responderErrorApi(res, error, "Error al eliminar actor")
    }
}

export { listarActores, listarActor, crearActor, actualizarActor, eliminarActor }
