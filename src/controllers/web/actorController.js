import actorService from '../../services/actorService.js'
import { responderErrorWeb } from '../../lib/errorResponses.js'
import { obtenerTiposActor } from '../../lib/tiposActor.js'

const listarActoresWeb = async (req, res) => {
	try {
		const actores = await actorService.obtenerActores()
		const titulo = 'Listado de actores'

		res.render('actores/listado', { actores, titulo })
	} catch (error) {
		responderErrorWeb(res, error, 'Error al cargar listado de actores')
	}
}

const renderFormularioNuevoActorWeb = (req, res) => {
	try {
		const tipos = obtenerTiposActor()
		const titulo = 'Alta de nuevo actor'

		res.render('actores/nuevo', { tipos, titulo })
	} catch (error) {
		responderErrorWeb(res, error, 'Error al cargar formulario nuevo actor')
	}
}

const crearActorWeb = async (req, res) => {
	try {
		const { nombre, email, password, tipo } = req.body

		await actorService.crearActor(nombre, email, password, tipo)

		res.redirect('/actores')
	} catch (error) {
		responderErrorWeb(res, error, 'Error al crear actor')
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
		responderErrorWeb(res, error, 'Error al cargar formulario editar actor')
	}
}

const actualizarActorWeb = async (req, res) => {
	try {
		const id = req.params.id
		const { nombre, email, password, tipo, activo } = req.body

		const actor = await actorService.actualizarActor(
			id,
			nombre,
			email,
			password,
			tipo,
			activo,
		)

		if (!actor) {
			return res
				.status(404)
				.render('error', { mensaje: 'Actor no encontrado' })
		}

		res.redirect('/actores')
	} catch (error) {
		responderErrorWeb(res, error, 'Error al actualizar actor')
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
		responderErrorWeb(res, error, 'Error al cambiar estado')
	}
}

export {
	listarActoresWeb,
	renderFormularioNuevoActorWeb,
	crearActorWeb,
	renderFormularioEditarActorWeb,
	actualizarActorWeb,
	cambiarEstadoWeb,
}
