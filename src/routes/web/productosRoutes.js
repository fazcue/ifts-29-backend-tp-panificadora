import { Router } from 'express'
import {
	cambiarEstadoProductoWeb,
	actualizarProductoWeb,
	crearProductoWeb,
	eliminarProductoWeb,
	formularioEditarProductoWeb,
	formularioNuevoProductoWeb,
	listarProductosWeb,
} from '../../controllers/producto.controller.js'
import { validarProductoWeb } from '../../middlewares/producto.middleware.js'
import { tienePermisosWeb } from '../../middlewares/abac.middleware.js'

const router = Router()

router.get('/', tienePermisosWeb('productos', 'ver'), listarProductosWeb)
router.get('/nuevo', tienePermisosWeb('productos', 'crear'), formularioNuevoProductoWeb)
router.post('/nuevo', tienePermisosWeb('productos', 'crear'), validarProductoWeb, crearProductoWeb)
router.get('/editar/:id', tienePermisosWeb('productos', 'editar'), formularioEditarProductoWeb)
router.post('/editar/:id', tienePermisosWeb('productos', 'editar'),	validarProductoWeb,	actualizarProductoWeb)
router.post('/cambiar-estado/:id', tienePermisosWeb('productos', 'cambiarEstado'), cambiarEstadoProductoWeb)
router.post('/eliminar/:id', tienePermisosWeb('productos', 'eliminar'), eliminarProductoWeb)

export default router
