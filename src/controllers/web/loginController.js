import actorService from '../../services/actorService.js'
import bcryptjs from 'bcryptjs'

const datosLogin = async (datos = {}) => {
	const existePlanta = await actorService.existeActorPlanta()
	const altaPlantaHabilitada = Boolean(process.env.CLAVE_ALTA_PLANTA?.trim())

	return {
		...datos,
		mostrarAltaPlanta: !existePlanta && altaPlantaHabilitada,
	}
}

const renderLogin = async (res, datos = {}) => {
	try {
		return res.render('login', await datosLogin(datos))
	} catch (error) {
		return res.render('login', datos)
	}
}

const formularioLogin = async (req, res) => {
	await renderLogin(res)
}

const portada = (req, res) => res.render('portada')

const ingresar = async (req, res, next) => {
	try {
		const { email, password } = req.body
		const actor = await actorService.buscarActorPorEmail(email)

		if (!actor || !actor.password || !bcryptjs.compareSync(password, actor.password)) {
			return await renderLogin(res, { error: 'Email o contraseña incorrectos' })
		}

		// sesion
        req.session.user = {
            id: actor._id,
            nombre: actor.nombre,
            email: actor.email,
            tipo: actor.tipo,
            activo: actor.activo
        }

        req.session.save(async (error) => {
            if (error) {
                console.error('Error al guardar sesión:', error)
                return await renderLogin(res, { error: 'Ocurrió un error interno en el servidor' })
            }

            res.redirect('/portada')
        })
	} catch (error) {
        console.error("Error al ingresar:", error)
        return await renderLogin(res, { error: 'Ocurrió un error interno en el servidor' })
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

export { formularioLogin, portada, ingresar, cerrarSesion }
