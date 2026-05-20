import mongoose from 'mongoose'

const pedidoSchema = new mongoose.Schema(
    {
		fecha_pedido: {
			type: Date,
			required: false,
            default: Date.now
		},
		fecha_entrega_esperada: {
			type: String,
			required: [true, 'La fecha de entrega es obligatoria'],
		},
		fecha_entrega_real: {
			type: String,
            required: false,
			default: null,
		},
		estado: {
			type: String,
            enum: [ 'PENDIENTE', 'EN_PRODUCCION', 'DESPACHADO', 'ENTREGADO' ],
			required: false,
			default: 'PENDIENTE',
		},
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Actor',
            required: [true, 'El id del actor es obligatorio']
        }
	},
	{
		timestamps: true,
	},
)

export default mongoose.model('Pedido', pedidoSchema)
