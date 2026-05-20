import mongoose from 'mongoose'

const actorSchema = new mongoose.Schema(
	{
		nombre: {
			type: String,
			required: [true, 'El nombre es obligatorio'],
            trim: true,
            unique: true
		},
		email: {
			type: String,
			required: [true, 'El email es obligatorio'],
            trim: true,
            lowercase: true,
            unique: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido'],
		},
		tipo: {
			type: String,
			enum: ['PLANTA', 'SUCURSAL', 'FRANQUICIA'],
			required: [true, 'El tipo es obligatorio'],
            trim: true,
            uppercase: true,
		},
		activo: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	{
		timestamps: true,
	},
)

export default mongoose.model('Actor', actorSchema)
