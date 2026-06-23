import { Router } from 'express'
import { listarProductosApi, listarProductoApi, crearProductoApi, actualizarProductoApi, eliminarProductoApi } from '../../controllers/producto.controller.js'
import { validarProductoApi } from '../../middlewares/producto.middleware.js'
import { tienePermisosApi } from '../../middlewares/abac.middleware.js'

const router = Router()

router.get('/', tienePermisosApi('productos', 'ver'), listarProductosApi)
router.get('/:id', tienePermisosApi('productos', 'ver'), listarProductoApi)
router.post('/', tienePermisosApi('productos', 'crear'), validarProductoApi, crearProductoApi)
router.put('/:id', tienePermisosApi('productos', 'editar'), validarProductoApi, actualizarProductoApi)
router.delete('/:id', tienePermisosApi('productos', 'eliminar'), eliminarProductoApi)

export default router
