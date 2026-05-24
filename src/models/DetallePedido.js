import mongoose from 'mongoose'

const detallePedidoSchema = new mongoose.Schema(
    {
        pedido: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pedido',
            required: [true, 'El pedido es obligatorio'],
        },
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto',
            required: [true, 'El producto es obligatorio'],
        },
        cantidad: {
            type: Number,
            required: [true, 'La cantidad es obligatoria'],
            min: [1, 'La cantidad debe ser mayor a cero'],
            validate: {
                validator: Number.isInteger,
                message: 'La cantidad debe ser un numero entero',
            },
        },
        precio_unitario: {
            type: Number,
            required: [true, 'El precio unitario es obligatorio'],
            min: [0.01, 'El precio unitario debe ser mayor a cero'],
        },
    },
    {
        timestamps: true,
    },
)

// índice compuesto (evita repetir productos en cada pedido)
detallePedidoSchema.index({ pedido: 1, producto: 1 }, { unique: true })

export default mongoose.model('DetallePedido', detallePedidoSchema)
