import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'

// Fechas
const fechaValida = (fecha) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(fecha) && !Number.isNaN(Date.parse(fecha))
}

const fmtFecha = (fecha) => {
	if (!fecha) return ''

	const d = new Date(fecha)

	if (isNaN(d.getTime())) return ''

	return d.toISOString().slice(0, 10)
}

// Id mongoDB
const esIdValido = (id) => mongoose.isValidObjectId(id)

// Contraseña
const encriptarPassword = (password) => {
    return bcryptjs.hashSync(password, 10)
}

export { fechaValida, fmtFecha, esIdValido, encriptarPassword }
