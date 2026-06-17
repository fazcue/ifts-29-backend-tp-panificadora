import reporteService from "../../services/reporteService.js"
import { responderErrorWeb } from "../../lib/errorResponses.js"
import { fmtFecha } from "../../lib/utils.js"

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

const listarRetrasosEntregasWeb = async (req, res) => {
    try {
        const pedidos = await reporteService.obtenerRetrasosEntregas()
        const titulo = "Retrasos en entregas"

        res.render("reportes/retrasosEntregas", { pedidos, titulo, fmtFecha })
    } catch (error) {
        responderErrorWeb(res, error, "Error al obtener retrasos en entregas")
    }
}

export { listarAccesosReportes, listarDemandaProduccionWeb, listarRetrasosEntregasWeb }
