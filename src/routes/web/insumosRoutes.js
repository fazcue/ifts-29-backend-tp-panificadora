import { Router } from 'express'
import {
    cambiarEstadoInsumoWeb,
    actualizarInsumoWeb,
    crearInsumoWeb,
    eliminarInsumoWeb,
    renderFormularioEditarInsumoWeb,
    renderFormularioNuevoInsumoWeb,
    listarInsumosWeb,
} from '../../controllers/insumo.controller.js'
import { validarInsumoWeb } from '../../middlewares/insumo.middleware.js'
import { tienePermisosWeb } from '../../middlewares/abac.middleware.js'

const router = Router()

router.get('/', tienePermisosWeb('insumos', 'ver'), listarInsumosWeb)
router.get('/nuevo', tienePermisosWeb('insumos', 'crear'), renderFormularioNuevoInsumoWeb)
router.post('/nuevo', tienePermisosWeb('insumos', 'crear'), validarInsumoWeb, crearInsumoWeb)
router.get('/editar/:id', tienePermisosWeb('insumos', 'editar'), renderFormularioEditarInsumoWeb)
router.post('/editar/:id', tienePermisosWeb('insumos', 'editar'), validarInsumoWeb, actualizarInsumoWeb)
router.post('/cambiar-estado/:id', tienePermisosWeb('insumos', 'cambiarEstado'), cambiarEstadoInsumoWeb)
router.post('/eliminar/:id', tienePermisosWeb('insumos', 'eliminar'), eliminarInsumoWeb)

export default router
