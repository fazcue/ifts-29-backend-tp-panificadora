import session from 'express-session'
import MongoStore from 'connect-mongo'
import dotenv from 'dotenv'

dotenv.config({ quiet: true })

const store = MongoStore.create({
	mongoUrl: process.env.MONGO_URI,
	ttl: 14 * 24 * 60 * 60,
})

const configurarSesion = session({
	secret: process.env.SESION_SECRETO,
	resave: false,
	saveUninitialized: false,
	store,
	cookie: {
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 3600000,
	},
})

const inyectarDatosUsuario = (req, res, next) => {
	res.locals.user = req.session.user || null
	next()
}

const iniciarSesion = (req, res, actor, opciones = {}) => {
	const rutaRedireccion = opciones.rutaRedireccion || '/portada'
	const mensajeError = opciones.mensajeError || 'Ocurrió un error interno en el servidor'

	req.session.user = {
		id: actor._id,
		nombre: actor.nombre,
		email: actor.email,
		tipo: actor.tipo,
		activo: actor.activo,
	}

	req.session.save((error) => {
		if (error) {
			return res.render('login', { mensaje: mensajeError })
		}

		res.redirect(rutaRedireccion)
	})
}

export { configurarSesion, inyectarDatosUsuario, iniciarSesion, store }
