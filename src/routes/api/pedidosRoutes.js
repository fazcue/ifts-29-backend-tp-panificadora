import { Router } from 'express'
import { listarPedidosApi, listarPedidoApi, crearPedidoApi, actualizarPedidoApi, eliminarPedidoApi } from '../../controllers/pedido.controller.js'
import { validarCrearPedidoApi, validarActualizarPedidoApi } from '../../middlewares/pedido.middleware.js'
import { tienePermisosApi } from '../../middlewares/abac.middleware.js'
import { cargarPedido } from '../../loaders/resourceLoaders.js'

const router = Router()

router.get('/', tienePermisosApi('pedidos', 'ver'), listarPedidosApi)
router.get('/:id', tienePermisosApi('pedidos', 'ver', cargarPedido), listarPedidoApi)
router.post('/', tienePermisosApi('pedidos', 'crear'), validarCrearPedidoApi, crearPedidoApi)
router.put('/:id', tienePermisosApi('pedidos', 'editar', cargarPedido), validarActualizarPedidoApi, actualizarPedidoApi)
router.delete('/:id', tienePermisosApi('pedidos', 'eliminar', cargarPedido), eliminarPedidoApi)

export default router
