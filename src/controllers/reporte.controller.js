import reporteService from '../services/reporte.service.js'
import { fmtFecha } from '../lib/utils.js'
import { normalizarError, respuestaError } from '../validators/response.validator.js'

const listarAccesosReportes = async (req, res) => {
    try {
        const titulo = 'Reportes'

        res.render('reportes/accesos', { titulo })
    } catch (error) {
        const resultado = normalizarError(error, 'Error al cargar accesos de reportes')
        respuestaError(res, resultado, true)
    }
}

const listarDemandaProduccionWeb = async (req, res) => {
    try {
        const demanda = await reporteService.obtenerDemandaConsolidada()
        const titulo = 'Demanda Consolidada'

        res.render('reportes/demandaConsolidada', { demanda, titulo })
    } catch (error) {
        const resultado = normalizarError(error, 'Error al obtener demanda de producción')
        respuestaError(res, resultado, true)
    }
}

const listarRetrasosEntregasWeb = async (req, res) => {
    try {
        const pedidos = await reporteService.obtenerRetrasosEntregas()
        const titulo = 'Retrasos en entregas'

        res.render('reportes/retrasosEntregas', { pedidos, titulo, fmtFecha })
    } catch (error) {
        const resultado = normalizarError(error, 'Error al obtener retrasos en entregas')
        respuestaError(res, resultado, true)
    }
}

export { listarAccesosReportes, listarDemandaProduccionWeb, listarRetrasosEntregasWeb }
