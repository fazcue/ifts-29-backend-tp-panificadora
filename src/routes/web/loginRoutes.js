import { Router } from 'express'
import {
	formularioLogin,
	portada,
	ingresar,
	cerrarSesion,
} from '../../controllers/web/loginController.js'
import {
	crearPlantaInicialWeb,
	renderFormularioAltaPlantaWeb,
} from '../../controllers/web/actorController.js'
import { protegerWeb } from '../../middlewares/auth.js'
import validarActorWeb, {
	validarClaveAltaPlantaWeb,
} from '../../middlewares/web/validarActorWeb.js'

const router = Router()

router.get('/', formularioLogin)
router.post('/', ingresar)
router.get('/alta-planta', renderFormularioAltaPlantaWeb)
router.post(
	'/alta-planta',
	validarClaveAltaPlantaWeb,
	validarActorWeb,
	crearPlantaInicialWeb,
)
router.get('/portada', protegerWeb, portada)
router.get('/salir', cerrarSesion)

export default router
