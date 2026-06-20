import { Router } from 'express'
import { listarActores, listarActor, crearActor, actualizarActor, eliminarActor } from '../../controllers/api/actorController.js'
import { validarActorApi } from '../../middlewares/actor.middleware.js'
import { tienePermisosApi } from '../../middlewares/abac.middleware.js'

const router = Router()

router.get('/', tienePermisosApi('actores', 'ver'), listarActores)
router.get('/:id', tienePermisosApi('actores', 'ver'), listarActor)
router.post('/', tienePermisosApi('actores', 'crear'), validarActorApi, crearActor)
router.put('/:id', tienePermisosApi('actores', 'editar'), validarActorApi, actualizarActor)
router.delete('/:id', tienePermisosApi('actores', 'eliminar'), eliminarActor)

export default router
