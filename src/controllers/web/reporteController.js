import reporteService from "../../services/reporte.service.js"
import { fmtFecha } from "../../lib/utils.js"

const listarAccesosReportes = async (req, res) => {
    try {
        const titulo = "Reportes"

        res.render("reportes/accesos", { titulo })
    } catch (error) {
        res.status(500).render('error', { mensaje: 'Error al cargar accesos de reportes' })
    }
}

const listarDemandaProduccionWeb = async (req, res) => {
    try {
        const demanda = await reporteService.obtenerDemandaConsolidada()
        const titulo = "Demanda Consolidada"

        res.render("reportes/demandaConsolidada", { demanda, titulo })
    } catch (error) {
        res.status(500).render('error', { mensaje: 'Error al obtener demanda de producción' })
    }
}

const listarRetrasosEntregasWeb = async (req, res) => {
    try {
        const pedidos = await reporteService.obtenerRetrasosEntregas()
        const titulo = "Retrasos en entregas"

        res.render("reportes/retrasosEntregas", { pedidos, titulo, fmtFecha })
    } catch (error) {
        res.status(500).render('error', { mensaje: 'Error al obtener retrasos en entregas' })
    }
}

export { listarAccesosReportes, listarDemandaProduccionWeb, listarRetrasosEntregasWeb }
