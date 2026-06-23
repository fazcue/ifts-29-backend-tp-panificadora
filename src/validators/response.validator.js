const errorValidacion = (mensaje, estado = 400) => ({
    ok: false,
    mensaje,
    estado
})

const exitoValidacion = (valor = null) => ({
    ok: true,
    mensaje: "",
    estado: 200,
    valor
})

const normalizarError = (error,	mensajePorDefecto = 'Error interno del servidor') => {
	// Error de validación de Mongoose, 400 con detalle
	if (error.name === 'ValidationError') {
		const mensajes = Object.values(error.errors).map((e) => e.message).join('. ')
		return { estado: 400, mensaje: mensajes }
	}

	// Error de negocio con código personalizado (ej. 409)
	if (error.estado) {
		return { estado: error.estado, mensaje: error.message }
	}

	// Error inesperado, 500 + log para debugging
	console.error('Error no manejado:', error)
	return { estado: 500, mensaje: mensajePorDefecto }
}

const respuestaError = (res, resultado, esWeb = false, vistaActual = 'error', datosFormulario = {}) => {
    if (esWeb) {
        return res.status(resultado.estado).render(vistaActual, { mensaje: resultado.mensaje, ...datosFormulario })
    }

    return res.status(resultado.estado).json({ error: resultado.mensaje })
}

export {
    errorValidacion,
    exitoValidacion,
    normalizarError,
    respuestaError
}
