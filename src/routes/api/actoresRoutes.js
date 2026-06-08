import { Router } from 'express'
import { listarActores, listarActor, crearActor, actualizarActor, eliminarActor } from '../../controllers/api/actorController.js'
import validarActor from '../../middlewares/api/validarActor.js'
import { tienePermisosApi } from '../../middlewares/abac.js'

const router = Router()

router.get('/', tienePermisosApi('actores', 'ver'), listarActores)
router.get('/:id', tienePermisosApi('actores', 'ver'), listarActor)
router.post('/', tienePermisosApi('actores', 'crear'), validarActor, crearActor)
router.put('/:id', tienePermisosApi('actores', 'editar'), validarActor, actualizarActor)
router.delete('/:id', tienePermisosApi('actores', 'eliminar'), eliminarActor)

export default router
