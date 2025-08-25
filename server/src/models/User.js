import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true
	},
	phoneNumber: {
		type: String,
		trim: true
	},
	passwordHash: {
		type: String,
		required: true
	},
	role: {
		type: String,
		enum: ['admin', 'tenant', 'guard'],
		required: true
	},
	apartmentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Apartment'
	},
	apartmentNumber: {
		type: String,
		trim: true
	},
	flatNumber: {
		type: String,
		trim: true
	},
	flatName: {
		type: String,
		trim: true
	},
	isActive: {
		type: Boolean,
		default: true
	}
}, {
	timestamps: true
})

// Note: Password hashing is handled in the auth routes before saving
// This pre-save hook was causing double hashing issues

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
	return bcrypt.compare(candidatePassword, this.passwordHash)
}

export default mongoose.model('User', userSchema)


