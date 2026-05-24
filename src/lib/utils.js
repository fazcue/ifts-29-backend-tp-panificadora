import mongoose from 'mongoose'

const fechaValida = (fecha) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(fecha) && !Number.isNaN(Date.parse(fecha))
}

const esIdValido = (id) => mongoose.isValidObjectId(id)

export { fechaValida, esIdValido }
