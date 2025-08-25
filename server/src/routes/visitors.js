import express from 'express'
import Visitor from '../models/Visitor.js'
import User from '../models/User.js'
import { requireAuth, requireRoles } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error.js'
import { upload, uploadVisitorPhoto, uploadVisitorIdCard } from '../lib/cloudinary.js'

const router = express.Router()

// Get all visitors (Admin only)
router.get('/', requireAuth, requireRoles(['admin']), asyncHandler(async (req, res) => {
	const visitors = await Visitor.find({ apartmentId: req.user.apartmentId })
		.populate('registeredBy', 'name')
		.sort({ checkInDateTime: -1 })

	res.json({ visitors })
}))

// Get visitors for a specific apartment (Tenant only)
router.get('/my-visitors', requireAuth, requireRoles(['tenant']), asyncHandler(async (req, res) => {
	// Get the user details from database to access apartment information
	const user = await User.findById(req.user.userId)
	if (!user) {
		return res.status(404).json({ message: 'User not found' })
	}

	// Get the tenant's apartment number from their profile
	const tenantApartment = user.apartmentNumber || user.flatNumber || user.flatName

	if (!tenantApartment) {
		return res.status(400).json({ message: 'Apartment information not found for tenant' })
	}

	// Find visitors where visitingApartment matches the tenant's apartment
	const visitors = await Visitor.find({ 
		apartmentId: req.user.apartmentId,
		visitingApartment: tenantApartment
	})
		.populate('registeredBy', 'name')
		.sort({ checkInDateTime: -1 })

	res.json({ visitors })
}))

// Get today's visitors (Guard only)
router.get('/today', requireAuth, requireRoles(['guard']), asyncHandler(async (req, res) => {
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const tomorrow = new Date(today)
	tomorrow.setDate(tomorrow.getDate() + 1)

	const visitors = await Visitor.find({
		apartmentId: req.user.apartmentId,
		checkInDateTime: {
			$gte: today,
			$lt: tomorrow
		}
	})
		.populate('registeredBy', 'name')
		.sort({ checkInDateTime: -1 })

	res.json({ visitors })
}))

// Get active visitors (currently checked in)
router.get('/active', requireAuth, requireRoles(['guard', 'admin']), asyncHandler(async (req, res) => {
	const visitors = await Visitor.find({
		apartmentId: req.user.apartmentId,
		status: 'checked-in'
	})
		.populate('registeredBy', 'name')
		.sort({ checkInDateTime: -1 })

	res.json({ visitors })
}))

// Add new visitor (Guard only)
router.post('/', requireAuth, requireRoles(['guard']), upload.fields([
	{ name: 'photo', maxCount: 1 },
	{ name: 'idCardPhoto', maxCount: 1 }
]), asyncHandler(async (req, res) => {
	const {
		name,
		phoneNumber,
		visitingApartment,
		checkInDateTime,
		purpose
	} = req.body

	// Validate required fields
	if (!name || !phoneNumber || !visitingApartment || !checkInDateTime || !purpose) {
		return res.status(400).json({ message: 'All fields are required' })
	}

	// Validate that both photos were uploaded
	if (!req.files || !req.files.photo || !req.files.idCardPhoto) {
		return res.status(400).json({ message: 'Both visitor photo and ID card photo are required' })
	}

	// Validate check-in date is not in the future
	const checkInDate = new Date(checkInDateTime)
	if (checkInDate > new Date()) {
		return res.status(400).json({ message: 'Check-in date cannot be in the future' })
	}

	try {
		// Upload both photos to Cloudinary
		const [photoUrl, idCardPhotoUrl] = await Promise.all([
			uploadVisitorPhoto(req.files.photo[0].buffer),
			uploadVisitorIdCard(req.files.idCardPhoto[0].buffer)
		])

		const visitor = new Visitor({
			name,
			phoneNumber,
			photo: photoUrl,
			idCardPhoto: idCardPhotoUrl,
			visitingApartment,
			checkInDateTime: checkInDate,
			purpose,
			registeredBy: req.user.userId,
			apartmentId: req.user.apartmentId
		})

		await visitor.save()

		// Populate the registeredBy field for response
		await visitor.populate('registeredBy', 'name')

		res.status(201).json({ visitor })
	} catch (error) {
		console.error('Error creating visitor:', error)
		res.status(500).json({ message: 'Failed to create visitor' })
	}
}))



// Check out visitor (Guard only)
router.patch('/:id/checkout', requireAuth, requireRoles(['guard']), asyncHandler(async (req, res) => {
	const { checkOutDateTime } = req.body

	if (!checkOutDateTime) {
		return res.status(400).json({ message: 'Check-out date and time is required' })
	}

	const visitor = await Visitor.findOne({
		_id: req.params.id,
		apartmentId: req.user.apartmentId
	})

	if (!visitor) {
		return res.status(404).json({ message: 'Visitor not found' })
	}

	if (visitor.status === 'checked-out') {
		return res.status(400).json({ message: 'Visitor is already checked out' })
	}

	// Validate check-out date is not before check-in date
	const checkOutDate = new Date(checkOutDateTime)
	if (checkOutDate < visitor.checkInDateTime) {
		return res.status(400).json({ message: 'Check-out date cannot be before check-in date' })
	}

	visitor.checkOutDateTime = checkOutDate
	visitor.status = 'checked-out'
	await visitor.save()

	await visitor.populate('registeredBy', 'name')

	res.json({ visitor })
}))

// Get visitor statistics
router.get('/stats', requireAuth, requireRoles(['admin', 'guard']), asyncHandler(async (req, res) => {
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const tomorrow = new Date(today)
	tomorrow.setDate(tomorrow.getDate() + 1)

	const [todayVisitors, activeVisitors, totalVisitors] = await Promise.all([
		Visitor.countDocuments({
			apartmentId: req.user.apartmentId,
			checkInDateTime: {
				$gte: today,
				$lt: tomorrow
			}
		}),
		Visitor.countDocuments({
			apartmentId: req.user.apartmentId,
			status: 'checked-in'
		}),
		Visitor.countDocuments({
			apartmentId: req.user.apartmentId
		})
	])

	res.json({
		todayVisitors,
		activeVisitors,
		totalVisitors
	})
}))



export default router
