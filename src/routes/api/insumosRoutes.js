import { Router } from 'express'
import {
    actualizarInsumo,
    crearInsumo,
    eliminarInsumo,
    listarInsumo,
    listarInsumos,
} from '../../controllers/api/insumoController.js'
import validarInsumo from '../../middlewares/api/validarInsumo.js'
import { tienePermisosApi } from '../../middlewares/abac.js'

const router = Router()

router.get('/', tienePermisosApi('insumos', 'ver'), listarInsumos)
router.get('/:id', tienePermisosApi('insumos', 'ver'), listarInsumo)
router.post('/', tienePermisosApi('insumos', 'crear'), validarInsumo, crearInsumo)
router.put('/:id', tienePermisosApi('insumos', 'editar'), validarInsumo, actualizarInsumo)
router.delete('/:id', tienePermisosApi('insumos', 'eliminar'), eliminarInsumo)

export default router
