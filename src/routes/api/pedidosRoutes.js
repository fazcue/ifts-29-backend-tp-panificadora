import { Router } from "express"
import { actualizarPedido, crearPedido, eliminarPedido, listarPedido, listarPedidos } from "../../controllers/api/pedidoController.js"
import { validarCrearPedido, validarActualizarPedido } from "../../middlewares/api/validarPedido.js"
import { cargarPedido, tienePermisosApi } from "../../middlewares/abac.js"

const router = Router()

router.get("/", tienePermisosApi("pedidos", "ver"), listarPedidos)
router.get("/:id", tienePermisosApi("pedidos", "ver", cargarPedido), listarPedido)
router.post("/", tienePermisosApi("pedidos", "crear"), validarCrearPedido, crearPedido)
router.put("/:id", tienePermisosApi("pedidos", "editar", cargarPedido), validarActualizarPedido, actualizarPedido)
router.delete("/:id", tienePermisosApi("pedidos", "eliminar", cargarPedido), eliminarPedido)

export default router
