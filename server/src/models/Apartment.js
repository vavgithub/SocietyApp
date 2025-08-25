import mongoose from 'mongoose'

const facilitySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	description: {
		type: String,
		required: true,
		trim: true
	},
	location: {
		type: String,
		required: true,
		trim: true
	},
	capacity: {
		type: String,
		trim: true
	},
	maintenanceContact: {
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

const apartmentSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	address: {
		type: String,
		required: true,
		trim: true
	},
	housingType: {
		type: String,
		enum: ['villa', 'flat'],
		required: true,
		default: 'villa'
	},
	adminId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	isEnrollmentComplete: {
		type: Boolean,
		default: false
	},
	enrollmentData: {
		totalUnits: {
			type: Number,
			default: 0
		},
		amenities: [{
			type: String,
			trim: true
		}],
		contactInfo: {
			phone: {
				type: String,
				trim: true
			},
			email: {
				type: String,
				trim: true
			}
		},
		additionalInfo: {
			type: String,
			trim: true
		},
		wings: [{
			name: {
				type: String,
				required: true,
				trim: true
			},
			apartmentPrefix: {
				type: String,
				required: true,
				trim: true
			},
			apartmentsPerFloor: {
				type: Number,
				required: true,
				min: 1
			}
		}],
		flats: [{
			name: {
				type: String,
				required: true,
				trim: true
			},
			flatPrefix: {
				type: String,
				required: true,
				trim: true
			},
			numberOfFloors: {
				type: Number,
				required: true,
				min: 1
			},
			roomsPerFloor: {
				type: Number,
				required: true,
				min: 1
			}
		}]
	},
	facilities: [facilitySchema],
	invitedUsers: [{
		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true
		},
		role: {
			type: String,
			enum: ['tenant', 'guard'],
			required: true
		},
		invitedAt: {
			type: Date,
			default: Date.now
		},
		isRegistered: {
			type: Boolean,
			default: false
		}
	}]
}, {
	timestamps: true
})

export default mongoose.model('Apartment', apartmentSchema)
