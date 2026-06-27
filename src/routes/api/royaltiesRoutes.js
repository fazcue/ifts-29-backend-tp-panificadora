import { Router } from 'express'
import {
    listarRoyaltiesApi,
    calcularRoyaltyApi,
    cambiarEstadoRoyaltyApi,
} from '../../controllers/royalty.controller.js'
import { tienePermisosApi } from '../../middlewares/abac.middleware.js'

const router = Router()

router.get('/', tienePermisosApi('reportes', 'ver'), listarRoyaltiesApi)
router.post('/calcular', tienePermisosApi('reportes', 'ver'), calcularRoyaltyApi)
router.patch('/:id/estado', tienePermisosApi('reportes', 'ver'), cambiarEstadoRoyaltyApi)

export default router
