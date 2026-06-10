import { Router } from 'express'
import { listarAccesosReportes, listarDemandaProduccionWeb } from '../../controllers/web/reporteController.js'
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

export default router
