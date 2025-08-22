import mongoose from 'mongoose'

const InviteSchema = new mongoose.Schema({
	email: { type: String, required: true, index: true },
	role: { type: String, enum: ['tenant','guard'], required: true },
	token: { type: String, required: true, unique: true, index: true },
	expiresAt: { type: Date, required: true },
	usedAt: { type: Date },
	invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

InviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Invite = mongoose.model('Invite', InviteSchema)
