import { Router } from 'express'
import { listarActores, listarActor, crearActor, actualizarActor, eliminarActor } from '../../controllers/api/actorController.js'
import validarActor from '../../middlewares/api/validarActor.js'

const router = Router()

router.get('/', listarActores)
router.get('/:id', listarActor)
router.post('/', validarActor, crearActor)
router.put('/:id', validarActor, actualizarActor)
router.delete('/:id', eliminarActor)

export default router
