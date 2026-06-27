import mongoose from 'mongoose'

const ESTADOS_COBRO = ['PENDIENTE', 'FACTURADO', 'COBRADO']

const royaltySchema = new mongoose.Schema(
    {
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Actor',
            required: [true, 'El actor es obligatorio'],
        },
        periodo: {
            type: String,
            required: [true, 'El período es obligatorio'],
            match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'El período debe tener formato YYYY-MM'],
        },
        monto_calculado: {
            type: Number,
            required: [true, 'El monto es obligatorio'],
            min: [0, 'El monto no puede ser negativo'],
        },
        estado: {
            type: String,
            enum: {
                values: ESTADOS_COBRO,
                message: 'El estado debe ser: ' + ESTADOS_COBRO.join(', '),
            },
            default: 'PENDIENTE',
        },
    },
    {
        timestamps: true,
    },
)

royaltySchema.index({ actor: 1, periodo: 1 }, { unique: true })

export default mongoose.model('Royalty', royaltySchema)
