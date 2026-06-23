import { Router } from 'express'
import { validarActorApi } from '../../middlewares/actor.middleware.js'
import { tienePermisosApi } from '../../middlewares/abac.middleware.js'
import { listarActoresApi, listarActorApi, crearActorApi, actualizarActorApi, eliminarActorApi } from '../../controllers/actor.controller.js'

const router = Router()

router.get('/', tienePermisosApi('actores', 'ver'), listarActoresApi)
router.get('/:id', tienePermisosApi('actores', 'ver'), listarActorApi)
router.post('/', tienePermisosApi('actores', 'crear'), validarActorApi, crearActorApi)
router.put('/:id', tienePermisosApi('actores', 'editar'), validarActorApi, actualizarActorApi)
router.delete('/:id', tienePermisosApi('actores', 'eliminar'), eliminarActorApi)

export default router
