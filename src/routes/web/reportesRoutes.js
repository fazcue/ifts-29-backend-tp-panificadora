import { Router } from 'express'
import { listarAccesosReportes, listarDemandaProduccionWeb, listarRetrasosEntregasWeb } from '../../controllers/reporte.controller.js'
import { tienePermisosWeb } from '../../middlewares/abac.middleware.js'

const router = Router()

router.get('/',	tienePermisosWeb('reportes', 'ver'), listarAccesosReportes)
router.get('/demanda-consolidada', tienePermisosWeb('reportes', 'ver'), listarDemandaProduccionWeb)
router.get('/retrasos-entregas', tienePermisosWeb('reportes', 'ver'), listarRetrasosEntregasWeb)

export default router
