import reporteService from "../../services/reporteService.js"
import { responderErrorWeb } from "../../lib/errorResponses.js"

const listarAccesosReportes = async (req, res) => {
    try {
        const titulo = "Reportes"

        res.render("reportes/accesos", { titulo })
    } catch (error) {
        responderErrorWeb(res, error, "Error al cargar accesos de reportes")
    }
}

const listarDemandaProduccionWeb = async (req, res) => {
    try {
        const demanda = await reporteService.obtenerDemandaConsolidada()
        const titulo = "Demanda Consolidada"

        res.render("reportes/demandaConsolidada", { demanda, titulo })
    } catch (error) {
        responderErrorWeb(res, error, "Error al obtener demanda de producción")
    }
}

export { listarAccesosReportes, listarDemandaProduccionWeb }
