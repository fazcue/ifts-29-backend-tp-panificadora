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

const respuestaError = (res, resultado, esWeb = false, vistaActual = 'error', datosFormulario = {}) => {
    if (esWeb) {
        return res.status(resultado.estado).render(vistaActual, { mensaje: resultado.mensaje, ...datosFormulario })
    }

    return res.status(resultado.estado).json({ error: resultado.mensaje })
}

export {
    errorValidacion,
    exitoValidacion,
    respuestaError
}
