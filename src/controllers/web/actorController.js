import actorService from '../../services/actorService.js'

const listarActoresWeb = async (req, res) => {
    try {
        const actores = await actorService.obtenerActores()
        const titulo = 'Listado de actores'

        res.render('actores/listado', { actores, titulo })
    } catch (error) {
        res.status(500).send("Error al cargar listado de actores")
    }
}

const formularioNuevoActorWeb = async (req, res) => {
    try {
        const tipos = await actorService.obtenerTipos()
        const titulo = 'Alta de nuevo actor'

        res.render('actores/nuevo', { tipos, titulo })
    } catch (error) {
        res.status(500).send("Error al cargar formulario nuevo actor")
    }
}

const crearActorWeb = async (req, res) => {
    try {
        const { nombre, email, tipo } = req.body
        
        await actorService.crearActor(nombre, email, tipo)

        res.redirect('/actores')
    } catch (error) {
        res.status(500).send("Error al crear actor")
    }
}

const formularioEditarActorWeb = async (req, res) => {
    try {
        const id = req.params.id

        
        const actor = await actorService.buscarActorPorId(id)

        if (!actor) {
            return res.status(404).render('error', { mensaje: 'Actor no encontrado' })
        }

        const tipos = await actorService.obtenerTipos()
        const titulo = `Editar actor "${actor.nombre}"`

        res.render('actores/editar', { actor, tipos, titulo })
    } catch (error) {
        res.status(500).send("Error al cargar formulario editar actor")
    }
}

const actualizarActorWeb = async (req, res) => {
    try {
        const id = req.params.id
        const { nombre, email, tipo, activo } = req.body

        
        const actor = await actorService.actualizarActor(id, nombre, email, tipo, activo)

        if (!actor) {
            return res.status(404).render('error', { mensaje: 'Actor no encontrado' })
        }
        
        res.redirect('/actores')
    } catch (error) {
        res.status(500).send("Error al actualizar actor")
    }
}

const activarDesactivarActorWeb = async (req, res) => {
    try {
        const id = req.params.id

        const actor = await actorService.cambiarEstadoActor(id)

        if (!actor) {
            return res.status(404).render('error', { mensaje: 'Actor no encontrado' })
        }
        
        res.redirect('/actores')
    } catch (error) {
        res.status(500).send("Error al cambiar estado")
    }
    
}

export { listarActoresWeb, formularioNuevoActorWeb, crearActorWeb, formularioEditarActorWeb, actualizarActorWeb, activarDesactivarActorWeb }
