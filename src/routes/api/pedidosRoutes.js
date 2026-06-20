import { Router } from 'express'
import { actualizarPedido, crearPedido, eliminarPedido, listarPedido, listarPedidos } from '../../controllers/api/pedidoController.js'
import { validarCrearPedidoApi, validarActualizarPedidoApi } from '../../middlewares/pedido.middleware.js'
import { tienePermisosApi } from '../../middlewares/abac.middleware.js'
import { cargarPedido } from '../../loaders/resourceLoaders.js'

const router = Router()

router.get('/', tienePermisosApi('pedidos', 'ver'), listarPedidos)
router.get('/:id', tienePermisosApi('pedidos', 'ver', cargarPedido), listarPedido)
router.post('/', tienePermisosApi('pedidos', 'crear'), validarCrearPedidoApi, crearPedido)
router.put('/:id', tienePermisosApi('pedidos', 'editar', cargarPedido), validarActualizarPedidoApi, actualizarPedido)
router.delete('/:id', tienePermisosApi('pedidos', 'eliminar', cargarPedido), eliminarPedido)

export default router
