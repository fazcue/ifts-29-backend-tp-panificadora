import { Router } from 'express'
import {
	actualizarPedidoWeb,
	crearPedidoWeb,
	eliminarPedidoWeb,
	formularioEditarPedidoWeb,
	formularioNuevoPedidoWeb,
	listarPedidosWeb,
} from '../../controllers/web/pedidoController.js'
import {
	validarCrearPedidoWeb,
	validarActualizarPedidoWeb,
} from '../../middlewares/web/validarPedidoWeb.js'
import { tienePermisosWeb } from '../../middlewares/abac.js'
import { cargarPedido } from '../../loaders/resourceLoaders.js'

const router = Router()

router.get('/', tienePermisosWeb('pedidos', 'ver'), listarPedidosWeb)
router.get(
	'/nuevo',
	tienePermisosWeb('pedidos', 'crear'),
	formularioNuevoPedidoWeb,
)
router.post(
	'/nuevo',
	tienePermisosWeb('pedidos', 'crear'),
	validarCrearPedidoWeb,
	crearPedidoWeb,
)
router.get(
	'/editar/:id',
	tienePermisosWeb('pedidos', 'editar', cargarPedido),
	formularioEditarPedidoWeb,
)
router.post(
	'/editar/:id',
	tienePermisosWeb('pedidos', 'editar', cargarPedido),
	validarActualizarPedidoWeb,
	actualizarPedidoWeb,
)
router.post(
	'/eliminar/:id',
	tienePermisosWeb('pedidos', 'eliminar', cargarPedido),
	eliminarPedidoWeb,
)

export default router
