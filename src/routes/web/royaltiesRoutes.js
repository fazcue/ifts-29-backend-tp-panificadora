import { Router } from 'express'
import {
    listarRoyaltiesWeb,
    calcularRoyaltyWeb,
    renderFormularioCalcularWeb,
    cambiarEstadoRoyaltyWeb,
} from '../../controllers/royalty.controller.js'
import { tienePermisosWeb } from '../../middlewares/abac.middleware.js'

const router = Router()

router.get('/', tienePermisosWeb('reportes', 'ver'), listarRoyaltiesWeb)
router.get('/calcular', tienePermisosWeb('reportes', 'ver'), renderFormularioCalcularWeb)
router.post('/calcular', tienePermisosWeb('reportes', 'ver'), calcularRoyaltyWeb)
router.post('/cambiar-estado/:id', tienePermisosWeb('reportes', 'ver'), cambiarEstadoRoyaltyWeb)

export default router
