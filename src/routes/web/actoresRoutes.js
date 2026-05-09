import { Router } from 'express'
import { activarDesactivarActorWeb, actualizarActorWeb, crearActorWeb, formularioEditarActorWeb, formularioNuevoActorWeb, listarActoresWeb } from '../../controllers/web/actorController.js'
import validarActorWeb from '../../middlewares/validarActorWeb.js'

const router = Router()

router.get('/', listarActoresWeb)
router.get('/nuevo', formularioNuevoActorWeb)
router.post('/nuevo', validarActorWeb, crearActorWeb)
router.get('/editar/:id', formularioEditarActorWeb)
router.post('/editar/:id', validarActorWeb, actualizarActorWeb)
router.post('/activar-desactivar/:id', activarDesactivarActorWeb)

export default router
