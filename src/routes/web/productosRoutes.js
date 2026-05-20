import { Router } from 'express'
import {
    activarDesactivarProductoWeb,
    actualizarProductoWeb,
    crearProductoWeb,
    eliminarProductoWeb,
    formularioEditarProductoWeb,
    formularioNuevoProductoWeb,
    listarProductosWeb,
} from '../../controllers/web/productoController.js'
import validarProductoWeb from '../../middlewares/web/validarProductoWeb.js'

const router = Router()

router.get('/', listarProductosWeb)
router.get('/nuevo', formularioNuevoProductoWeb)
router.post('/nuevo', validarProductoWeb, crearProductoWeb)
router.get('/editar/:id', formularioEditarProductoWeb)
router.post('/editar/:id', validarProductoWeb, actualizarProductoWeb)
router.post('/activar-desactivar/:id', activarDesactivarProductoWeb)
router.post('/eliminar/:id', eliminarProductoWeb)

export default router
