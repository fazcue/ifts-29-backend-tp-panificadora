import { Router } from 'express'
import { actualizarProducto, crearProducto, eliminarProducto, listarProducto, listarProductos } from '../../controllers/api/productoController.js'
import { validarProductoApi } from '../../middlewares/producto.middleware.js'
import { tienePermisosApi } from '../../middlewares/abac.middleware.js'

const router = Router()

router.get('/', tienePermisosApi('productos', 'ver'), listarProductos)
router.get('/:id', tienePermisosApi('productos', 'ver'), listarProducto)
router.post('/', tienePermisosApi('productos', 'crear'), validarProductoApi, crearProducto)
router.put('/:id', tienePermisosApi('productos', 'editar'), validarProductoApi, actualizarProducto)
router.delete('/:id', tienePermisosApi('productos', 'eliminar'), eliminarProducto)

export default router
