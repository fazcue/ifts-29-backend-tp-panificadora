import { Router } from 'express'
import {
    listarInsumosApi,
    listarInsumoApi,
    crearInsumoApi,
    actualizarInsumoApi,
    eliminarInsumoApi,
} from '../../controllers/insumo.controller.js'
import { validarInsumoApi } from '../../middlewares/insumo.middleware.js'
import { tienePermisosApi } from '../../middlewares/abac.middleware.js'

const router = Router()

router.get('/', tienePermisosApi('insumos', 'ver'), listarInsumosApi)
router.get('/:id', tienePermisosApi('insumos', 'ver'), listarInsumoApi)
router.post('/', tienePermisosApi('insumos', 'crear'), validarInsumoApi, crearInsumoApi)
router.put('/:id', tienePermisosApi('insumos', 'editar'), validarInsumoApi, actualizarInsumoApi)
router.delete('/:id', tienePermisosApi('insumos', 'eliminar'), eliminarInsumoApi)

export default router
