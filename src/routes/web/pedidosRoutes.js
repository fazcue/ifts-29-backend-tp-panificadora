import { Router } from 'express'
import {
	actualizarPedidoWeb,
	crearPedidoWeb,
	eliminarPedidoWeb,
	renderFormularioEditarPedidoWeb,
	renderFormularioNuevoPedidoWeb,
	listarPedidosWeb,
	renderListadoPedidos
} from '../../controllers/pedido.controller.js'
import { validarCrearPedidoWeb, validarActualizarPedidoWeb } from '../../middlewares/pedido.middleware.js'
import { tienePermisosWeb } from '../../middlewares/abac.middleware.js'
import { cargarPedido } from '../../loaders/resourceLoaders.js'

const router = Router()

router.get('/', tienePermisosWeb('pedidos', 'ver'), listarPedidosWeb)
router.get('/nuevo', tienePermisosWeb('pedidos', 'crear'), renderFormularioNuevoPedidoWeb)
router.post('/nuevo', tienePermisosWeb('pedidos', 'crear'), validarCrearPedidoWeb, crearPedidoWeb)
router.get('/editar/:id', tienePermisosWeb('pedidos', 'editar', cargarPedido), renderFormularioEditarPedidoWeb)
router.post('/editar/:id', tienePermisosWeb('pedidos', 'editar', cargarPedido),	validarActualizarPedidoWeb,	actualizarPedidoWeb)
router.post('/eliminar/:id', tienePermisosWeb('pedidos', 'eliminar', cargarPedido),	eliminarPedidoWeb)

//Re-renderizar listado (websocket)
router.get('/listado', tienePermisosWeb('pedidos', 'ver'), renderListadoPedidos)

export default router
