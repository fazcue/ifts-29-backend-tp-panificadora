import { politicas } from '../policies/abacPolicies.js'

const responderErrorWeb = (res, estado, mensaje) => {
    return res.status(estado).render('error', { mensaje })
}

const responderErrorApi = (res, estado, mensaje) => {
    return res.status(estado).json({ error: mensaje })
}

const tienePermisos = (modulo, accion, cargarRecurso, responderError) => {
    return async (req, res, next) => {
        const user = req.session.user
        const recurso = cargarRecurso ? await cargarRecurso(req) : null

        if (cargarRecurso && !recurso) {
            return responderError(res, 404, 'Recurso no encontrado')
        }

        const politica = politicas[modulo]?.[accion]
        const permitido = politica?.(user, recurso, req) === true

        if (!permitido) {
            return responderError(
                res,
                403,
                'Acceso denegado. No tienes permisos para realizar dicha acción.'
            )
        }

        next()
    }
}

const tienePermisosWeb = (modulo, accion, cargarRecurso = null) => {
    return tienePermisos(modulo, accion, cargarRecurso, responderErrorWeb)
}

const tienePermisosApi = (modulo, accion, cargarRecurso = null) => {
    return tienePermisos(modulo, accion, cargarRecurso, responderErrorApi)
}

export { tienePermisosWeb, tienePermisosApi }
