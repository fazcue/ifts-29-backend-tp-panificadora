import { Router } from 'express'
import {
    actualizarInsumo,
    crearInsumo,
    eliminarInsumo,
    listarInsumo,
    listarInsumos,
} from '../../controllers/api/insumoController.js'
import { validarInsumoApi } from '../../middlewares/insumo.middleware.js'
import { tienePermisosApi } from '../../middlewares/abac.middleware.js'

const router = Router()

router.get('/', tienePermisosApi('insumos', 'ver'), listarInsumos)
router.get('/:id', tienePermisosApi('insumos', 'ver'), listarInsumo)
router.post('/', tienePermisosApi('insumos', 'crear'), validarInsumoApi, crearInsumo)
router.put('/:id', tienePermisosApi('insumos', 'editar'), validarInsumoApi, actualizarInsumo)
router.delete('/:id', tienePermisosApi('insumos', 'eliminar'), eliminarInsumo)

export default router
