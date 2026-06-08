import { Router } from 'express'
import { actualizarProducto, crearProducto, eliminarProducto, listarProducto, listarProductos } from '../../controllers/api/productoController.js'
import validarProducto from '../../middlewares/api/validarProducto.js'
import { tienePermisosApi } from '../../middlewares/abac.js'

const router = Router()

router.get('/', tienePermisosApi('productos', 'ver'), listarProductos)
router.get('/:id', tienePermisosApi('productos', 'ver'), listarProducto)
router.post('/', tienePermisosApi('productos', 'crear'), validarProducto, crearProducto)
router.put('/:id', tienePermisosApi('productos', 'editar'), validarProducto, actualizarProducto)
router.delete('/:id', tienePermisosApi('productos', 'eliminar'), eliminarProducto)

export default router
