import actorService from '../../services/actorService.js'

const ingresar = async (req, res, next) => {
	try {
		const { email } = req.body
		const actor = await actorService.buscarActorPorEmail(email)

		if (!actor) {
			return res.status(404).render('login', { error: 'Actor inexistente' })
		}

		res.redirect('/portada')
	} catch (error) {
		res.status(500).send('Error al ingresar')
	}
}



export { ingresar }
