import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true, index: true },
	phone: { type: String },
	role: { type: String, enum: ['tenant','admin','guard'], required: true },
	passwordHash: { type: String, required: true },
	isActive: { type: Boolean, default: true }
}, { timestamps: true })

UserSchema.methods.toSafeJSON = function() {
	const obj = this.toObject({ versionKey: false })
	delete obj.passwordHash
	return obj
}

export const User = mongoose.model('User', UserSchema)
