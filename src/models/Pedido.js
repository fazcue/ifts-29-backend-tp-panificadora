import mongoose from 'mongoose'
import { ESTADOS_PEDIDO, obtenerEstadosPedido } from '../lib/estadosPedido.js'

const pedidoSchema = new mongoose.Schema(
    {
		fecha_pedido: {
			type: Date,
			required: false,
            default: Date.now
		},
		fecha_entrega_esperada: {
			type: Date,
			required: [true, 'La fecha de entrega es obligatoria'],
		},
		fecha_entrega_real: {
			type: Date,
            required: false,
			default: null,
		},
		estado: {
			type: String,
            enum: obtenerEstadosPedido(),
			required: false,
			default: ESTADOS_PEDIDO.PENDIENTE,
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

// virtual: permite utilizar 'populate' para traer los productos (detallePedido)
pedidoSchema.virtual('productos', {
    ref: 'DetallePedido',
    localField: '_id',
    foreignField: 'pedido',
})

pedidoSchema.set('toJSON', { virtuals: true })
pedidoSchema.set('toObject', { virtuals: true })

export default mongoose.model('Pedido', pedidoSchema)
