import { politicas } from '../policies/abacPolicies.js'
import { respuestaError } from '../validators/response.validator.js'

const tienePermisosBase = (modulo, accion, cargarRecurso, esWeb) => {
    return async (req, res, next) => {
        const user = req.session.user
        const recurso = cargarRecurso ? await cargarRecurso(req) : null

        if (cargarRecurso && !recurso) {
            const resultado = { estado: 404, mensaje: 'Recurso no encontrado' }
            return respuestaError(res, resultado, esWeb)
        }

        const politica = politicas[modulo]?.[accion]
        const permitido = politica?.(user, recurso, req) === true

        if (!permitido) {
            const resultado = { estado: 403, mensaje: 'Acceso denegado. No tienes permisos para realizar dicha acción.' }
            return respuestaError(res, resultado, esWeb)
        }

        next()
    }
}

const tienePermisosWeb = (modulo, accion, cargarRecurso = null) => {
    return tienePermisosBase(modulo, accion, cargarRecurso, true)
}

const tienePermisosApi = (modulo, accion, cargarRecurso = null) => {
    return tienePermisosBase(modulo, accion, cargarRecurso, false)
}

export { tienePermisosWeb, tienePermisosApi }
