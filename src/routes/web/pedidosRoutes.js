import { Router } from "express"
import {
    actualizarPedidoWeb,
    crearPedidoWeb,
    eliminarPedidoWeb,
    formularioEditarPedidoWeb,
    formularioNuevoPedidoWeb,
    listarPedidosWeb
} from "../../controllers/web/pedidoController.js"
import { validarCrearPedidoWeb, validarActualizarPedidoWeb } from "../../middlewares/web/validarPedidoWeb.js"

const router = Router()

router.get("/", listarPedidosWeb)
router.get("/nuevo", formularioNuevoPedidoWeb)
router.post("/nuevo", validarCrearPedidoWeb, crearPedidoWeb)
router.get("/editar/:id", formularioEditarPedidoWeb)
router.post("/editar/:id", validarActualizarPedidoWeb, actualizarPedidoWeb)
router.post("/eliminar/:id", eliminarPedidoWeb)

export default router
