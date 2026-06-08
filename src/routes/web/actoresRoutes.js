import { Router } from 'express'
import {
	cambiarEstadoWeb,
	actualizarActorWeb,
	crearActorWeb,
	renderFormularioEditarActorWeb,
	renderFormularioNuevoActorWeb,
	listarActoresWeb,
} from '../../controllers/web/actorController.js'
import validarActorWeb from '../../middlewares/web/validarActorWeb.js'
import { tienePermisosWeb } from '../../middlewares/abac.js'

const router = Router()

router.get('/', tienePermisosWeb('actores', 'ver'), listarActoresWeb)
router.get(
	'/nuevo',
	tienePermisosWeb('actores', 'crear'),
	renderFormularioNuevoActorWeb,
)
router.post(
	'/nuevo',
	tienePermisosWeb('actores', 'crear'),
	validarActorWeb,
	crearActorWeb,
)
router.get(
	'/editar/:id',
	tienePermisosWeb('actores', 'editar'),
	renderFormularioEditarActorWeb,
)
router.post(
	'/editar/:id',
	tienePermisosWeb('actores', 'editar'),
	validarActorWeb,
	actualizarActorWeb,
)
router.post(
	'/cambiar-estado/:id',
	tienePermisosWeb('actores', 'cambiarEstado'),
	cambiarEstadoWeb,
)

export default router
