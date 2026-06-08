import actorService from '../../services/actorService.js'
import { responderErrorWeb } from '../../lib/errorResponses.js'
import { TIPOS_ACTOR, obtenerTiposActor } from '../../lib/tiposActor.js'

const datosFormularioAltaPlanta = (datos = {}) => ({
	tipos: [TIPOS_ACTOR.PLANTA],
	actor: {
		nombre: datos.nombre,
		email: datos.email,
		tipo: TIPOS_ACTOR.PLANTA,
	},
	claveAltaPlanta: datos.claveAltaPlanta,
	modoAltaPlanta: true,
	formAction: '/alta-planta',
	cancelarHref: '/',
	titulo: 'Alta inicial de planta',
})

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

const renderFormularioAltaPlantaWeb = async (req, res) => {
	try {
		if (!process.env.CLAVE_ALTA_PLANTA?.trim()) {
			return res
				.status(500)
				.render('error', { mensaje: 'No está configurada la clave de alta de planta' })
		}

		if (await actorService.existeActorPlanta()) {
			return res
				.status(409)
				.render('error', { mensaje: 'Ya existe un actor de tipo PLANTA' })
		}

		res.render('actores/nuevo', datosFormularioAltaPlanta())
	} catch (error) {
		responderErrorWeb(res, error, 'Error al cargar formulario alta planta')
	}
}

const crearPlantaInicialWeb = async (req, res) => {
	try {
		const { nombre, email, password } = req.body

		const actor = await actorService.crearActor(
			nombre,
			email,
			password,
			TIPOS_ACTOR.PLANTA,
		)

		req.session.user = {
			id: actor._id,
			nombre: actor.nombre,
			email: actor.email,
			tipo: actor.tipo,
			activo: actor.activo,
		}

		req.session.save((error) => {
			if (error) {
				console.error('Error al guardar sesión:', error)
				return res.render('login', {
					error: 'La planta fue creada, pero ocurrió un error al iniciar sesión',
				})
			}

			res.redirect('/portada')
		})
	} catch (error) {
		responderErrorWeb(res, error, 'Error al crear planta')
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
	renderFormularioAltaPlantaWeb,
	crearPlantaInicialWeb,
	renderFormularioEditarActorWeb,
	actualizarActorWeb,
	cambiarEstadoWeb,
}
