import session from 'express-session'
import MongoStore from 'connect-mongo'
import dotenv from 'dotenv'

dotenv.config()

const configurarSesion = session({
	secret: process.env.SESION_SECRETO,
	resave: false,
	saveUninitialized: false,
	store: MongoStore.create({
		mongoUrl: process.env.MONGO_URI,
		ttl: 14 * 24 * 60 * 60,
	}),
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

export { configurarSesion, inyectarDatosUsuario }
