import { Router } from 'express'
import { validarActorWeb } from '../../middlewares/actor.middleware.js'
import { tienePermisosWeb } from '../../middlewares/abac.middleware.js'
import { listarActoresWeb, renderFormularioNuevoActorWeb, renderFormularioEditarActorWeb, crearActorWeb, actualizarActorWeb, cambiarEstadoWeb } from '../../controllers/actor.controller.js'

const router = Router()

router.get('/', tienePermisosWeb('actores', 'ver'), listarActoresWeb)
router.get('/nuevo', tienePermisosWeb('actores', 'crear'), renderFormularioNuevoActorWeb)
router.post('/nuevo', tienePermisosWeb('actores', 'crear'),	validarActorWeb, crearActorWeb)
router.get('/editar/:id', tienePermisosWeb('actores', 'editar'), renderFormularioEditarActorWeb)
router.post('/editar/:id', tienePermisosWeb('actores', 'editar'), validarActorWeb, actualizarActorWeb)
router.post('/cambiar-estado/:id', tienePermisosWeb('actores', 'cambiarEstado'), cambiarEstadoWeb)

export default router
