import mongoose from 'mongoose'
import { TIPOS_ACTOR } from '../lib/tiposActor.js'

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
			enum: Object.values(TIPOS_ACTOR),
			required: [true, 'El tipo es obligatorio'],
            trim: true,
            uppercase: true,
		},
		activo: {
			type: Boolean,
			required: false,
			default: false,
		},
		password: {
			type: String,
			required: [true, 'La contraseña es obligatoria']
		}
	},
	{ timestamps: true }
)

actorSchema.set('toObject', { virtuals: true })
actorSchema.index( { tipo: 1 }, { unique: true, partialFilterExpression: { tipo: TIPOS_ACTOR.PLANTA } })

export default mongoose.model('Actor', actorSchema)
