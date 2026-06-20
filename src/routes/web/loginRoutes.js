import { Router } from 'express'
import { 
	renderFormularioLogin,
	portada,
	ingresar,
	cerrarSesion,
	renderFormularioAltaPlantaWeb,
	crearPlantaInicialWeb
} from '../../controllers/web/loginController.js'
import { protegerWeb } from '../../middlewares/auth.middleware.js'
import { validarActorWeb } from '../../middlewares/actor.middleware.js'
import { validarClaveAltaPlantaWeb } from '../../middlewares/login.middleware.js'

const router = Router()

router.get('/', renderFormularioLogin)
router.post('/', ingresar)
router.get('/alta-planta', renderFormularioAltaPlantaWeb)
router.post('/alta-planta',	validarClaveAltaPlantaWeb, validarActorWeb,	crearPlantaInicialWeb)
router.get('/portada', protegerWeb, portada)
router.get('/salir', cerrarSesion)

export default router
