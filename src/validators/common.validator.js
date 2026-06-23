import { errorValidacion, exitoValidacion } from './response.validator.js'

const validarTextoObligatorio = (valor, nombreCampo) => {
    if (typeof valor !== 'string') {
        return errorValidacion(`El campo ${nombreCampo} debe ser texto`)
    }

    const limpio = valor.trim()

    if (!limpio) {
        return errorValidacion(`El campo ${nombreCampo} es obligatorio`)
    }

    return exitoValidacion(limpio)
}

const validarNombreUnico = async (nombre, idActual, obtenerTodos, nombreEntidad) => {
	const todos = await obtenerTodos()
	const nombreNormalizado = nombre.trim().toLowerCase()

	const existe = todos.some((item) =>	item.id !== idActual &&	item.nombre.trim().toLowerCase() === nombreNormalizado)

	if (existe)
		return errorValidacion(`Ya existe un ${nombreEntidad} con el nombre "${nombre}"`, 409)
	
    return exitoValidacion(nombre)
}

export { validarTextoObligatorio, validarNombreUnico }
