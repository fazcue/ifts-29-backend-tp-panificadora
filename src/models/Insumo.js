import mongoose from 'mongoose'
import { obtenerUnidades } from '../lib/unidades.js'

const insumoSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true,
            unique: true,
        },
        unidad: {
            type: String,
            enum: {
                values: obtenerUnidades(),
                message: 'La unidad debe ser una de: ' + obtenerUnidades().join(', '),
            },
            required: [true, 'La unidad es obligatoria'],
            trim: true,
            lowercase: true,
        },
        balance: {
            type: Number,
            required: [true, 'El balance es obligatorio'],
            min: [0, 'El balance no puede ser negativo'],
            validate: {
                validator: Number.isInteger,
                message: 'El balance debe ser un número entero',
            },
        },
        activo: {
            type: Boolean,
            required: false,
            default: true,
        },
    },
    {
        timestamps: true,
    },
)

export default mongoose.model('Insumo', insumoSchema)
