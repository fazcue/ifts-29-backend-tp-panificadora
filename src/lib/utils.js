import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs'

const fechaValida = (fecha) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(fecha) && !Number.isNaN(Date.parse(fecha))
}

const esIdValido = (id) => mongoose.isValidObjectId(id)

const encriptarPassword = (password) => {
    return bcryptjs.hashSync(password, 10)
}

export { fechaValida, esIdValido, encriptarPassword }
