const obtenerEstadoError = (error, estadoDefault = 500) => {
    return error?.estado || error?.status || estadoDefault
}

const obtenerMensajeError = (error, mensajeDefault) => {
    return error?.message || mensajeDefault
}

const responderErrorWeb = (res, error, mensajeDefault, estadoDefault = 500) => {
    const estado = obtenerEstadoError(error, estadoDefault)
    const mensaje = obtenerMensajeError(error, mensajeDefault)

    return res.status(estado).render('error', { mensaje })
}

const responderErrorApi = (res, error, mensajeDefault, estadoDefault = 500) => {
    const estado = obtenerEstadoError(error, estadoDefault)
    const mensaje = obtenerMensajeError(error, mensajeDefault)

    return res.status(estado).json({ error: mensaje })
}

export { responderErrorWeb, responderErrorApi }
