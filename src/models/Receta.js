import mongoose from 'mongoose'

const recetaSchema = new mongoose.Schema(
    {
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto',
            required: [true, 'El producto es obligatorio'],
        },
        insumo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Insumo',
            required: [true, 'El insumo es obligatorio'],
        },
        cantidad_necesaria: {
            type: Number,
            required: [true, 'La cantidad necesaria es obligatoria'],
            min: [0.001, 'La cantidad necesaria debe ser mayor a cero'],
        },
    },
    {
        timestamps: true,
    },
)

// índice compuesto (evita repetir insumos en cada producto)
recetaSchema.index({ producto: 1, insumo: 1 }, { unique: true })

export default mongoose.model('Receta', recetaSchema)
