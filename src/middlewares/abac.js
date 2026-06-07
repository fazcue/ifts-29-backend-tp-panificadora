import { esPlanta } from "../lib/roles.js"
import pedidoService from "../services/pedidoService.js"

// Permisos segun módulo -> acción
const esPedidoPropio = (user, pedido) => {
    return String(pedido.actor) === String(user.id)
}

const politicas = {
    actores: {
        ver: (user) => esPlanta(user),
        crear: (user) => esPlanta(user),
        editar: (user) => esPlanta(user),
        cambiarEstado: (user) => esPlanta(user),
        eliminar: (user) => esPlanta(user)
    },
    productos: {
        ver: (user) => esPlanta(user),
        crear: (user) => esPlanta(user),
        editar: (user) => esPlanta(user),
        cambiarEstado: (user) => esPlanta(user),
        eliminar: (user) => esPlanta(user)
    },
    pedidos: {
        ver: (user) => Boolean(user),
        crear: (user) => esPlanta(user) || Boolean(user.activo),
        editar: (user, recurso) => esPlanta(user) || Boolean(user.activo) && esPedidoPropio(user, recurso) && recurso.estado === 'PENDIENTE',
        eliminar: (user, recurso) => esPlanta(user) || Boolean(user.activo) && esPedidoPropio(user, recurso) && recurso.estado === 'PENDIENTE'
    },
}

// Recursos
const cargarPedido = async (req) => {
    return await pedidoService.buscarPedidoPorId(req.params.id, 'actor estado')
}

// Middleware que controla permisos según actor -> módulo -> acción
const tienePermisosWeb = (modulo, accion, cargarRecurso = null) => {
    return async (req, res, next) => {
        const user = req.session.user

        const recurso = cargarRecurso ? await cargarRecurso(req) : null

        if (cargarRecurso && !recurso) {
            return res.status(404).render('error', { mensaje: 'Recurso no encontrado' })
        }

        const politica = politicas[modulo]?.[accion]
        const permitido = politica?.(user, recurso, req) === true

        if (!permitido) {
            return res.status(403).render('error', {
                mensaje: 'Acceso Denegado: No tienes permisos para realizar dicha acción.',
            })
        }

        next()
    }
}

export { tienePermisosWeb, cargarPedido }
