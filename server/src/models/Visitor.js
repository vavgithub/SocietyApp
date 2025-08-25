import mongoose from 'mongoose'

const visitorSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	phoneNumber: {
		type: String,
		required: true,
		trim: true
	},
	photo: {
		type: String, // URL to stored photo
		required: true
	},
	idCardPhoto: {
		type: String, // URL to stored ID card photo
		required: true
	},
	visitingApartment: {
		type: String,
		required: true,
		trim: true
	},
	checkInDateTime: {
		type: Date,
		required: true
	},
	checkOutDateTime: {
		type: Date,
		default: null
	},
	purpose: {
		type: String,
		required: true,
		trim: true
	},
	status: {
		type: String,
		enum: ['checked-in', 'checked-out'],
		default: 'checked-in'
	},
	registeredBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	apartmentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Apartment',
		required: true
	}
}, {
	timestamps: true
})

// Index for efficient queries
visitorSchema.index({ apartmentId: 1, checkInDateTime: -1 })
visitorSchema.index({ visitingApartment: 1, status: 1 })
visitorSchema.index({ registeredBy: 1, createdAt: -1 })

export default mongoose.model('Visitor', visitorSchema)
