import { Router } from 'express'
import { formularioLogin, portada, ingresar, cerrarSesion } from '../../controllers/web/loginController.js'
import { protegerWeb } from '../../middlewares/auth.js'

const router = Router()

router.get('/', formularioLogin)
router.post('/', ingresar)
router.get('/portada', protegerWeb, portada)
router.get('/salir', cerrarSesion)

export default router
