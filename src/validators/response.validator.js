const errorValidacion = (mensaje, estado = 400) => ({
    ok: false,
    mensaje,
    estado
})

const exito = (valor = null) => ({
    ok: true,
    mensaje: "",
    estado: 200,
    valor
})

const respuestaError = (res, resultado) => {
    return res.status(resultado.estado).json({ error: resultado.mensaje })
}

const respuestaErrorWeb = (res, vista, resultado, datosFormulario) => {
    return res.status(resultado.estado).render(vista, { error: resultado.mensaje, ...datosFormulario })
}

export default {
    errorValidacion,
    exito,
    respuestaError,
    respuestaErrorWeb
}
