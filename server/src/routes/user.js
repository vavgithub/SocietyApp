import express from 'express'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error.js'

const router = express.Router()

// Update user profile
router.put('/profile', requireAuth, asyncHandler(async (req, res) => {
	const { name, phoneNumber } = req.body

	// Validate required fields
	if (!name) {
		return res.status(400).json({ message: 'Name is required' })
	}

	// Find and update the user
	const user = await User.findById(req.user.userId)
	if (!user) {
		return res.status(404).json({ message: 'User not found' })
	}

	// Update the fields
	user.name = name
	if (phoneNumber !== undefined) {
		user.phoneNumber = phoneNumber
	}

	await user.save()

	// Return updated user data (excluding sensitive information)
	res.json({
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			phoneNumber: user.phoneNumber,
			role: user.role,
			apartmentId: user.apartmentId,
			apartmentNumber: user.apartmentNumber,
			flatNumber: user.flatNumber,
			flatName: user.flatName,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt
		}
	})
}))

export default router
