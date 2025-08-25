import express from 'express'
import { asyncHandler } from '../middleware/error.js'
import { requireAuth, requireRoles } from '../middleware/auth.js'
import Apartment from '../models/Apartment.js'
import User from '../models/User.js'

const router = express.Router()

// Get society details for guard
router.get('/society', requireAuth, requireRoles(['guard']), asyncHandler(async (req, res) => {
	const apartment = await Apartment.findById(req.user.apartmentId)
	if (!apartment) {
		return res.status(404).json({ message: 'Society not found' })
	}

	res.json({
		society: {
			id: apartment._id,
			name: apartment.name,
			address: apartment.address,
			housingType: apartment.housingType,
			isEnrollmentComplete: apartment.isEnrollmentComplete,
			enrollmentData: apartment.enrollmentData,
			facilities: apartment.facilities || []
		}
	})
}))

// Get occupied apartment/flat numbers (for visitor management)
router.get('/occupied-units', requireAuth, requireRoles(['guard']), asyncHandler(async (req, res) => {
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

export default router
