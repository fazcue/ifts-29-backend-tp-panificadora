import actorService from '../../services/actorService.js'

const listarActores = async (req, res) => {
    try {
        const actores = await actorService.obtenerActores()

        res.status(200).json(actores)
    } catch (error) {
        res.status(500).json({ error: 'Error al listar actores' })
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
        res.status(500).json({ error: 'Error al listar actor' })
    }
}

const crearActor = async (req, res) => {
    try {
        const { nombre, email, password, tipo } = req.body
        
        const nuevo = await actorService.crearActor(nombre, email, password, tipo)

        res.status(201).json(nuevo)
    } catch (error) {
        res.status(500).json({ error: 'Error al crear actor' })
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
        res.status(500).json({ error: 'Error al actualizar actor' })
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
        res.status(error.estado || 500).json({ error: error.message || "Error al eliminar actor" })
    }
}

export { listarActores, listarActor, crearActor, actualizarActor, eliminarActor }
