import mongoose from 'mongoose'

const announcementSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true
	},
	description: {
		type: String,
		required: true,
		trim: true
	},
	dueDate: {
		type: Date,
		required: true
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	apartmentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Apartment',
		required: true
	},
	isActive: {
		type: Boolean,
		default: true
	}
}, {
	timestamps: true
})

// Index for efficient queries
announcementSchema.index({ apartmentId: 1, dueDate: 1, isActive: 1 })

export default mongoose.model('Announcement', announcementSchema)
