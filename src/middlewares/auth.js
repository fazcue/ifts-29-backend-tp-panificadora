const protegerWeb = (req, res, next) => {
	if (!req.session.user) {
		return res.redirect('/')
	}
	next()
}

const protegerApi = (req, res, next) => {
	if (!req.session.user) {
		return res.status(401).json({
			status: 'error',
			message: 'No autorizado. Debe iniciar sesión.',
		})
	}
	next()
}

export { protegerWeb, protegerApi }
