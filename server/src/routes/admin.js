import express from 'express'
import { body, validationResult } from 'express-validator'
import { asyncHandler } from '../middleware/error.js'
import { requireAuth, requireRoles } from '../middleware/auth.js'
import Apartment from '../models/Apartment.js'
import User from '../models/User.js'

const router = express.Router()

// Get apartment information
router.get('/apartment', requireAuth, requireRoles(['admin']), asyncHandler(async (req, res) => {
	const apartment = await Apartment.findById(req.user.apartmentId)
	if (!apartment) {
		return res.status(404).json({ message: 'Apartment not found' })
	}
	res.json(apartment)
}))

// Get available apartment/flat numbers for invites
router.get('/available-units', requireAuth, requireRoles(['admin']), asyncHandler(async (req, res) => {
	const apartment = await Apartment.findById(req.user.apartmentId)
	if (!apartment) {
		return res.status(404).json({ message: 'Apartment not found' })
	}

	if (!apartment.isEnrollmentComplete) {
		return res.status(400).json({ message: 'Enrollment must be completed first' })
	}

	const availableUnits = []

	if (apartment.housingType === 'villa' && apartment.enrollmentData.wings) {
		// Generate villa numbers for each wing (villas are single-floor structures)
		apartment.enrollmentData.wings.forEach(wing => {
			for (let apt = 1; apt <= wing.apartmentsPerFloor; apt++) {
				const apartmentNumber = `${wing.apartmentPrefix}${apt.toString().padStart(2, '0')}`
				
				// Check if this apartment is already assigned
				const isAssigned = apartment.invitedUsers.some(invite => 
					invite.apartmentNumber === apartmentNumber && invite.isRegistered
				)
				
				if (!isAssigned) {
					availableUnits.push({
						value: apartmentNumber,
						label: `${apartmentNumber} (${wing.name})`
					})
				}
			}
		})
	} else if (apartment.housingType === 'flat' && apartment.enrollmentData.flats) {
		// Generate flat numbers for each flat building
		apartment.enrollmentData.flats.forEach(flat => {
			for (let floor = 1; floor <= flat.numberOfFloors; floor++) {
				for (let room = 1; room <= flat.roomsPerFloor; room++) {
					const flatNumber = `${flat.flatPrefix}${floor.toString().padStart(2, '0')}${room.toString().padStart(2, '0')}`
					const flatName = `${flat.name} - Floor ${floor} - Room ${room}`
					
					// Check if this flat is already assigned
					const isAssigned = apartment.invitedUsers.some(invite => 
						(invite.flatNumber === flatNumber || invite.flatName === flatName) && invite.isRegistered
					)
					
					if (!isAssigned) {
						availableUnits.push({
							value: flatNumber,
							label: `${flatNumber} (${flatName})`,
							flatName: flatName
						})
					}
				}
			}
		})
	}

	res.json({ availableUnits })
}))

// Get occupied apartment/flat numbers (for visitor management)
router.get('/occupied-units', requireAuth, requireRoles(['admin']), asyncHandler(async (req, res) => {
	const apartment = await Apartment.findById(req.user.apartmentId)
	if (!apartment) {
		return res.status(404).json({ message: 'Apartment not found' })
	}

	if (!apartment.isEnrollmentComplete) {
		return res.status(400).json({ message: 'Enrollment must be completed first' })
	}

	const occupiedUnits = []

	// Get all registered users with their apartment/flat assignments
	const registeredUsers = await User.find({
		apartmentId: req.user.apartmentId,
		role: 'tenant',
		isActive: true
	})

	if (apartment.housingType === 'villa' && apartment.enrollmentData.wings) {
		// For villas, check which units are occupied by registered tenants
		apartment.enrollmentData.wings.forEach(wing => {
			for (let apt = 1; apt <= wing.apartmentsPerFloor; apt++) {
				const apartmentNumber = `${wing.apartmentPrefix}${apt.toString().padStart(2, '0')}`
				
				// Check if this apartment is occupied by a registered tenant
				const isOccupied = registeredUsers.some(user => 
					user.apartmentNumber === apartmentNumber
				)
				
				if (isOccupied) {
					occupiedUnits.push({
						value: apartmentNumber,
						label: `${apartmentNumber} (${wing.name})`
					})
				}
			}
		})
	} else if (apartment.housingType === 'flat' && apartment.enrollmentData.flats) {
		// For flats, check which units are occupied by registered tenants
		apartment.enrollmentData.flats.forEach(flat => {
			for (let floor = 1; floor <= flat.numberOfFloors; floor++) {
				for (let room = 1; room <= flat.roomsPerFloor; room++) {
					const flatNumber = `${flat.flatPrefix}${floor.toString().padStart(2, '0')}${room.toString().padStart(2, '0')}`
					const flatName = `${flat.name} - Floor ${floor} - Room ${room}`
					
					// Check if this flat is occupied by a registered tenant
					const isOccupied = registeredUsers.some(user => 
						user.flatNumber === flatNumber || user.flatName === flatName
					)
					
					if (isOccupied) {
						occupiedUnits.push({
							value: flatNumber,
							label: `${flatNumber} (${flatName})`,
							flatName: flatName
						})
					}
				}
			}
		})
	}

	res.json({ occupiedUnits })
}))

// Complete enrollment
router.post('/complete-enrollment', requireAuth, requireRoles(['admin']), [
	body('contactInfo.phone').optional().isMobilePhone().withMessage('Valid phone number required'),
	body('contactInfo.email').optional().isEmail().withMessage('Valid email required'),
	body('additionalInfo').optional().isString().withMessage('Additional info must be a string'),
	// Wings validation (for villas)
	body('wings').optional().isArray().withMessage('Wings must be an array'),
	body('wings.*.name').optional().trim().isLength({ min: 1 }).withMessage('Wing name is required'),
	body('wings.*.apartmentPrefix').optional().trim().isLength({ min: 1 }).withMessage('Apartment prefix is required'),
	body('wings.*.apartmentsPerFloor').optional().isInt({ min: 1 }).withMessage('Number of apartments per floor must be at least 1'),
	// Flats validation (for flats)
	body('flats').optional().isArray().withMessage('Flats must be an array'),
	body('flats.*.name').optional().trim().isLength({ min: 1 }).withMessage('Flat name is required'),
	body('flats.*.flatPrefix').optional().trim().isLength({ min: 1 }).withMessage('Flat prefix is required'),
	body('flats.*.numberOfFloors').optional().isInt({ min: 1 }).withMessage('Number of floors must be at least 1'),
	body('flats.*.roomsPerFloor').optional().isInt({ min: 1 }).withMessage('Number of rooms per floor must be at least 1'),
	// Total units validation
	body('totalUnits').isInt({ min: 1 }).withMessage('Total units must be at least 1')
], asyncHandler(async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
	}

	const { totalUnits, contactInfo, additionalInfo, wings, flats } = req.body

	const apartment = await Apartment.findById(req.user.apartmentId)
	if (!apartment) {
		return res.status(404).json({ message: 'Apartment not found' })
	}

	// Validate based on housing type
	if (apartment.housingType === 'villa' && (!wings || wings.length === 0)) {
		return res.status(400).json({ message: 'At least one wing is required for villas' })
	}
	
	if (apartment.housingType === 'flat' && (!flats || flats.length === 0)) {
		return res.status(400).json({ message: 'At least one flat is required for flats' })
	}

	// Validate wing structure for villas
	if (apartment.housingType === 'villa' && wings) {
		for (const wing of wings) {
			if (!wing.name || !wing.apartmentPrefix || !wing.apartmentsPerFloor) {
				return res.status(400).json({ message: 'All wing fields are required: name, apartmentPrefix, apartmentsPerFloor' })
			}
		}
	}

	// Validate flat structure for flats
	if (apartment.housingType === 'flat' && flats) {
		for (const flat of flats) {
			if (!flat.name || !flat.flatPrefix || !flat.numberOfFloors || !flat.roomsPerFloor) {
				return res.status(400).json({ message: 'All flat fields are required: name, flatPrefix, numberOfFloors, roomsPerFloor' })
			}
		}
	}

	// Update enrollment data
	apartment.isEnrollmentComplete = true
	apartment.enrollmentData = {
		totalUnits,
		contactInfo: contactInfo || {},
		additionalInfo: additionalInfo || '',
		wings: wings || [],
		flats: flats || []
	}

	await apartment.save()

	res.json({
		message: 'Enrollment completed successfully',
		apartment: {
			id: apartment._id,
			name: apartment.name,
			address: apartment.address,
			housingType: apartment.housingType,
			isEnrollmentComplete: apartment.isEnrollmentComplete,
			enrollmentData: apartment.enrollmentData
		}
	})
}))

// Update apartment information
router.put('/apartment', requireAuth, requireRoles(['admin']), [
	body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
	body('address').optional().trim().isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
	body('housingType').optional().isIn(['villa', 'flat']).withMessage('Housing type must be either villa or flat'),
	body('enrollmentData.wings').optional().isArray().withMessage('Wings must be an array'),
	body('enrollmentData.wings.*.name').optional().trim().isLength({ min: 1 }).withMessage('Wing name is required'),
	body('enrollmentData.wings.*.apartmentPrefix').optional().trim().isLength({ min: 1 }).withMessage('Apartment prefix is required'),
	body('enrollmentData.wings.*.apartmentsPerFloor').optional().isInt({ min: 1 }).withMessage('Number of apartments per floor must be at least 1'),
	body('enrollmentData.flats').optional().isArray().withMessage('Flats must be an array'),
	body('enrollmentData.flats.*.name').optional().trim().isLength({ min: 1 }).withMessage('Flat name is required'),
	body('enrollmentData.flats.*.flatPrefix').optional().trim().isLength({ min: 1 }).withMessage('Flat prefix is required'),
	body('enrollmentData.flats.*.numberOfFloors').optional().isInt({ min: 1 }).withMessage('Number of floors must be at least 1'),
	body('enrollmentData.flats.*.roomsPerFloor').optional().isInt({ min: 1 }).withMessage('Number of rooms per floor must be at least 1')
], asyncHandler(async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
	}

	const { name, address, housingType, enrollmentData } = req.body

	const apartment = await Apartment.findById(req.user.apartmentId)
	if (!apartment) {
		return res.status(404).json({ message: 'Apartment not found' })
	}

	// Update fields if provided
	if (name) apartment.name = name
	if (address) apartment.address = address
	if (housingType) apartment.housingType = housingType
	
	// Update enrollment data if provided
	if (enrollmentData) {
		if (enrollmentData.wings) {
			apartment.enrollmentData.wings = enrollmentData.wings
		}
		if (enrollmentData.flats) {
			apartment.enrollmentData.flats = enrollmentData.flats
		}
		if (enrollmentData.contactInfo) {
			apartment.enrollmentData.contactInfo = enrollmentData.contactInfo
		}
		if (enrollmentData.additionalInfo !== undefined) {
			apartment.enrollmentData.additionalInfo = enrollmentData.additionalInfo
		}
	}

	await apartment.save()

	res.json({
		message: 'Apartment updated successfully',
		apartment: {
			id: apartment._id,
			name: apartment.name,
			address: apartment.address,
			housingType: apartment.housingType,
			isEnrollmentComplete: apartment.isEnrollmentComplete
		}
	})
}))

// Get users list
router.get('/users', requireAuth, requireRoles(['admin']), asyncHandler(async (req, res) => {
	const users = await User.find({ apartmentId: req.user.apartmentId }).select('-passwordHash')
	res.json(users)
}))

// Update user status
router.patch('/users/:id/status', requireAuth, requireRoles(['admin']), [
	body('isActive').isBoolean().withMessage('isActive must be a boolean')
], asyncHandler(async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
	}

	const { id } = req.params
	const { isActive } = req.body

	const user = await User.findOne({ _id: id, apartmentId: req.user.apartmentId })
	if (!user) {
		return res.status(404).json({ message: 'User not found' })
	}

	user.isActive = isActive
	await user.save()

	res.json({
		message: 'User status updated successfully',
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			isActive: user.isActive
		}
	})
}))

// Facilities management routes

// Get all facilities
router.get('/facilities', requireAuth, requireRoles(['admin']), asyncHandler(async (req, res) => {
	const apartment = await Apartment.findById(req.user.apartmentId)
	if (!apartment) {
		return res.status(404).json({ message: 'Apartment not found' })
	}
	res.json(apartment.facilities || [])
}))

// Add new facility
router.post('/facilities', requireAuth, requireRoles(['admin']), [
	body('name').trim().isLength({ min: 2 }).withMessage('Facility name must be at least 2 characters'),
	body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
	body('location').trim().isLength({ min: 2 }).withMessage('Location must be at least 2 characters'),
	body('capacity').optional().trim(),
	body('maintenanceContact').optional().trim()
], asyncHandler(async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
	}

	const { name, description, location, capacity, maintenanceContact } = req.body

	const apartment = await Apartment.findById(req.user.apartmentId)
	if (!apartment) {
		return res.status(404).json({ message: 'Apartment not found' })
	}

	const newFacility = {
		name,
		description,
		location,
		capacity,
		maintenanceContact,
		isActive: true
	}

	apartment.facilities.push(newFacility)
	await apartment.save()

	const addedFacility = apartment.facilities[apartment.facilities.length - 1]

	res.status(201).json({
		message: 'Facility added successfully',
		facility: {
			id: addedFacility._id,
			name: addedFacility.name,
			description: addedFacility.description,
			location: addedFacility.location,
			capacity: addedFacility.capacity,
			maintenanceContact: addedFacility.maintenanceContact,
			isActive: addedFacility.isActive
		}
	})
}))

// Update facility
router.put('/facilities/:id', requireAuth, requireRoles(['admin']), [
	body('name').trim().isLength({ min: 2 }).withMessage('Facility name must be at least 2 characters'),
	body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
	body('location').trim().isLength({ min: 2 }).withMessage('Location must be at least 2 characters'),
	body('capacity').optional().trim(),
	body('maintenanceContact').optional().trim()
], asyncHandler(async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
	}

	const { id } = req.params
	const { name, description, location, capacity, maintenanceContact } = req.body

	const apartment = await Apartment.findById(req.user.apartmentId)
	if (!apartment) {
		return res.status(404).json({ message: 'Apartment not found' })
	}

	const facilityIndex = apartment.facilities.findIndex(f => f._id.toString() === id)
	if (facilityIndex === -1) {
		return res.status(404).json({ message: 'Facility not found' })
	}

	apartment.facilities[facilityIndex].name = name
	apartment.facilities[facilityIndex].description = description
	apartment.facilities[facilityIndex].location = location
	apartment.facilities[facilityIndex].capacity = capacity
	apartment.facilities[facilityIndex].maintenanceContact = maintenanceContact

	await apartment.save()

	const updatedFacility = apartment.facilities[facilityIndex]

	res.json({
		message: 'Facility updated successfully',
		facility: {
			id: updatedFacility._id,
			name: updatedFacility.name,
			description: updatedFacility.description,
			location: updatedFacility.location,
			capacity: updatedFacility.capacity,
			maintenanceContact: updatedFacility.maintenanceContact,
			isActive: updatedFacility.isActive
		}
	})
}))

// Toggle facility status
router.patch('/facilities/:id/status', requireAuth, requireRoles(['admin']), [
	body('isActive').isBoolean().withMessage('isActive must be a boolean')
], asyncHandler(async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
	}

	const { id } = req.params
	const { isActive } = req.body

	const apartment = await Apartment.findById(req.user.apartmentId)
	if (!apartment) {
		return res.status(404).json({ message: 'Apartment not found' })
	}

	const facilityIndex = apartment.facilities.findIndex(f => f._id.toString() === id)
	if (facilityIndex === -1) {
		return res.status(404).json({ message: 'Facility not found' })
	}

	apartment.facilities[facilityIndex].isActive = isActive
	await apartment.save()

	const updatedFacility = apartment.facilities[facilityIndex]

	res.json({
		message: 'Facility status updated successfully',
		facility: {
			id: updatedFacility._id,
			name: updatedFacility.name,
			isActive: updatedFacility.isActive
		}
	})
}))

// Delete facility
router.delete('/facilities/:id', requireAuth, requireRoles(['admin']), asyncHandler(async (req, res) => {
	const { id } = req.params

	const apartment = await Apartment.findById(req.user.apartmentId)
	if (!apartment) {
		return res.status(404).json({ message: 'Apartment not found' })
	}

	const facilityIndex = apartment.facilities.findIndex(f => f._id.toString() === id)
	if (facilityIndex === -1) {
		return res.status(404).json({ message: 'Facility not found' })
	}

	const deletedFacility = apartment.facilities[facilityIndex]
	apartment.facilities.splice(facilityIndex, 1)
	await apartment.save()

	res.json({
		message: 'Facility deleted successfully',
		facility: {
			id: deletedFacility._id,
			name: deletedFacility.name
		}
	})
}))

export default router


