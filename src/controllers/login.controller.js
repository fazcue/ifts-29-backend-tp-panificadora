import actorService from '../services/actor.service.js'
import { TIPOS_ACTOR } from '../lib/tiposActor.js'
import bcryptjs from 'bcryptjs'
import { iniciarSesion } from '../config/session.js'
import { normalizarError, respuestaError } from '../validators/response.validator.js'

const portada = (req, res) => res.render('portada')

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

		res.render('actores/nuevo', { modoAltaPlanta: true, titulo: 'Alta inicial de planta'})
	} catch (error) {
		const resultado = normalizarError(error, 'Error al cargar formulario alta planta')
		respuestaError(res, resultado, true)
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

		iniciarSesion(req, res, actor, {
			mensajeError: 'La planta fue creada, pero ocurrió un error al iniciar sesión',
		})
	} catch (error) {
		const resultado = normalizarError(error, 'Error al crear planta')
		respuestaError(res, resultado, true)
	}
}

const renderFormularioLogin = async (req, res) => {
    if (!req.session.user) {
		return res.render('login')
    }

    res.redirect('/portada')
}

const ingresar = async (req, res) => {
	try {
		const { email, password } = req.body
		const actor = await actorService.buscarActorPorEmail(email)

		if (!actor || !actor.password || !bcryptjs.compareSync(password, actor.password)) {
            return res.render('login', { mensaje: 'Email o contraseña incorrectos' })
		}

		iniciarSesion(req, res, actor)
	} catch (error) {
		const resultado = normalizarError(error, 'Ocurrió un error interno en el servidor')
		respuestaError(res, resultado, true)
	}
}

const cerrarSesion = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err)
        }
        res.redirect('/')
    })
}

export { renderFormularioLogin, portada, ingresar, cerrarSesion, renderFormularioAltaPlantaWeb, crearPlantaInicialWeb }
