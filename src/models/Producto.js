import mongoose from 'mongoose'

const productoSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true,
            unique: true,
        },
        precio: {
            type: Number,
            required: [true, 'El precio es obligatorio'],
            validate: {
                validator: (valor) => valor > 0,
                message: 'El precio debe ser mayor a cero',
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

// virtual: permite utilizar 'populate' para traer los insumos (receta)
productoSchema.virtual('insumos', {
    ref: 'Receta',
    localField: '_id',
    foreignField: 'producto',
})

productoSchema.set('toJSON', { virtuals: true })
productoSchema.set('toObject', { virtuals: true })

export default mongoose.model('Producto', productoSchema)
