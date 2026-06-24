import { verificarToken } from '../services/jwt.service.js'

const protegerWeb = (req, res, next) => {
	if (!req.session.user) {
		return res.redirect('/')
	}
	next()
}

const protegerApi = (req, res, next) => {
	const authHeader = req.headers.authorization

	if (!authHeader?.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Token no proporcionado. Formato: Bearer <token>' })
	}

	try {
		const token = authHeader.split(' ')[1]
		req.user = verificarToken(token)
		next()
	} catch (error) {
		return res.status(401).json({ error: 'Token inválido o expirado' })
	}
}

export { protegerWeb, protegerApi }
