import express from 'express'
import { asyncHandler } from '../middleware/error.js'
import { requireAuth, requireRoles } from '../middleware/auth.js'
import Apartment from '../models/Apartment.js'

const router = express.Router()

// Get society details for tenant
router.get('/society', requireAuth, requireRoles(['tenant']), asyncHandler(async (req, res) => {
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

export default router
