import { Router } from "express"
import { actualizarPedido, crearPedido, eliminarPedido, listarPedido, listarPedidos } from "../../controllers/api/pedidoController.js"
import { validarCrearPedido, validarActualizarPedido } from "../../middlewares/api/validarPedido.js"

const router = Router()

router.get("/", listarPedidos)
router.get("/:id", listarPedido)
router.post("/", validarCrearPedido, crearPedido)
router.put("/:id", validarActualizarPedido, actualizarPedido)
router.delete("/:id", eliminarPedido)

export default router
