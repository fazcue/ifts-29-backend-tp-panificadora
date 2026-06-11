import { Router } from 'express'
import { listarAccesosReportes, listarDemandaProduccionWeb, listarRetrasosEntregasWeb } from '../../controllers/web/reporteController.js'
import { tienePermisosWeb } from '../../middlewares/abac.js'

const router = Router()

router.get(
	'/',
	tienePermisosWeb('reportes', 'ver'),
	listarAccesosReportes
)
router.get(
	'/demanda-consolidada',
	tienePermisosWeb('reportes', 'ver'),
	listarDemandaProduccionWeb
)
router.get(
	'/retrasos-entregas',
	tienePermisosWeb('reportes', 'ver'),
	listarRetrasosEntregasWeb
)

export default router
