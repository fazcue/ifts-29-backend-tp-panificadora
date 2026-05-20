import { Router } from 'express'
import { actualizarProducto, crearProducto, eliminarProducto, listarProducto, listarProductos } from '../../controllers/api/productoController.js'
import validarProducto from '../../middlewares/api/validarProducto.js'

const router = Router()

router.get('/', listarProductos)
router.get('/:id', listarProducto)
router.post('/', validarProducto, crearProducto)
router.put('/:id', validarProducto, actualizarProducto)
router.delete('/:id', eliminarProducto)

export default router
