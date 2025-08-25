import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { asyncHandler } from '../middleware/error.js'
import { requireAuth, requireRoles } from '../middleware/auth.js'
import User from '../models/User.js'
import Apartment from '../models/Apartment.js'
import { generateOTP, storeOTP, verifyOTP, sendOTP } from '../lib/otpManager.js'

const router = express.Router()

// Request OTP for invite registration
router.post('/request-invite-otp', [
	body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
	body('token').notEmpty().withMessage('Token is required')
], asyncHandler(async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
	}

	const { email, token } = req.body

	// Verify invite token
	let decoded
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET)
		if (decoded.type !== 'invite') {
			return res.status(400).json({ message: 'Invalid invite token' })
		}
	} catch (error) {
		return res.status(400).json({ message: 'Invalid or expired invite token' })
	}

	// Validate email matches token
	if (decoded.email !== email) {
		return res.status(400).json({ message: 'Email does not match the invite' })
	}

	// Check if user already exists
	const existingUser = await User.findOne({ email })
	if (existingUser) {
		return res.status(400).json({ message: 'User with this email already exists' })
	}

	// Generate and store OTP
	const otp = generateOTP()
	storeOTP(email, otp, 'invite-registration')

	// Send OTP via email
	const emailResult = await sendOTP(email, otp, 'invite-registration')
	
	if (!emailResult.success) {
		return res.status(500).json({ message: 'Failed to send OTP. Please try again.' })
	}

	res.json({ 
		message: 'OTP sent successfully to your email',
		email: email
	})
}))

// Generate invite token
router.post('/generate', requireAuth, requireRoles(['admin']), [
	body('role').isIn(['tenant', 'guard']).withMessage('Role must be either tenant or guard'),
	body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
	body('apartmentNumber').optional().trim().isLength({ min: 1 }).withMessage('Apartment number is required for tenants'),
	body('flatNumber').optional().trim().isLength({ min: 1 }).withMessage('Flat number is required for tenants'),
	body('flatName').optional().trim().isLength({ min: 1 }).withMessage('Flat name is required for tenants')
], asyncHandler(async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
	}

	const { role, email, apartmentNumber, flatNumber, flatName } = req.body

	// Check if user already exists
	const existingUser = await User.findOne({ email })
	if (existingUser) {
		return res.status(400).json({ message: 'User with this email already exists' })
	}

	// Check if user is already invited
	const apartment = await Apartment.findById(req.user.apartmentId)
	if (!apartment) {
		return res.status(400).json({ message: 'Apartment not found' })
	}

	const alreadyInvited = apartment.invitedUsers.find(invite => 
		invite.email === email && !invite.isRegistered
	)
	if (alreadyInvited) {
		return res.status(400).json({ message: 'User with this email has already been invited' })
	}

	// Validate villa/flat number for tenants
	if (role === 'tenant') {
		if (apartment.housingType === 'villa' && !apartmentNumber) {
			return res.status(400).json({ message: 'Villa number is required for tenants in villa complexes' })
		}
		if (apartment.housingType === 'flat' && !flatNumber && !flatName) {
			return res.status(400).json({ message: 'Flat number or name is required for tenants in flat complexes' })
		}
	}

	// Add to invited users list
	apartment.invitedUsers.push({
		email,
		role,
		apartmentNumber,
		flatNumber,
		flatName,
		invitedAt: new Date(),
		isRegistered: false
	})
	await apartment.save()

	// Create invite token with role, apartmentId, email, and apartment/flat info
	const inviteToken = jwt.sign(
		{
			role,
			apartmentId: req.user.apartmentId,
			email,
			apartmentNumber,
			flatNumber,
			flatName,
			type: 'invite'
		},
		process.env.JWT_SECRET,
		{ expiresIn: '15m' } // 15 minutes
	)

	// Create invite link
	const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?token=${inviteToken}`

	res.json({
		message: 'Invite generated successfully',
		inviteLink,
		expiresIn: '15 minutes'
	})
}))

// Accept invite and register user (with OTP verification)
router.post('/accept', [
	body('token').notEmpty().withMessage('Token is required'),
	body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
	body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
	body('password')
		.isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
		.matches(/^(?=.*[a-zA-Z])(?=.*\d)/).withMessage('Password must contain both letters and numbers'),
	body('confirmPassword').notEmpty().withMessage('Confirm password is required'),
	body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], asyncHandler(async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
	}

	const { token, name, email, password, confirmPassword, otp } = req.body

	// Check if passwords match
	if (password !== confirmPassword) {
		return res.status(400).json({ message: 'Passwords do not match' })
	}

	// Verify OTP
	const otpVerification = verifyOTP(email, otp, 'invite-registration')
	if (!otpVerification.valid) {
		return res.status(400).json({ message: otpVerification.message })
	}

	// Verify invite token
	let decoded
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET)
		if (decoded.type !== 'invite') {
			return res.status(400).json({ message: 'Invalid invite token' })
		}
	} catch (error) {
		return res.status(400).json({ message: 'Invalid or expired invite token' })
	}

	// Validate email matches token
	if (decoded.email !== email) {
		return res.status(400).json({ message: 'Email does not match the invite' })
	}

	// Check if user already exists
	const existingUser = await User.findOne({ email })
	if (existingUser) {
		return res.status(400).json({ message: 'User with this email already exists' })
	}

	// Verify apartment exists and user is in invited list
	const apartment = await Apartment.findById(decoded.apartmentId)
	if (!apartment) {
		return res.status(400).json({ message: 'Invalid apartment' })
	}

	const invitedUser = apartment.invitedUsers.find(invite => 
		invite.email === email && invite.role === decoded.role && !invite.isRegistered
	)
	if (!invitedUser) {
		return res.status(400).json({ message: 'Invalid invite or user already registered' })
	}

	// Hash password
	const saltRounds = 12
	const passwordHash = await bcrypt.hash(password, saltRounds)

	// Create user
	const user = new User({
		name,
		email,
		passwordHash,
		role: decoded.role,
		apartmentId: decoded.apartmentId,
		apartmentNumber: decoded.apartmentNumber,
		flatNumber: decoded.flatNumber,
		flatName: decoded.flatName,
		isActive: true
	})

	await user.save()

	// Mark user as registered in apartment
	invitedUser.isRegistered = true
	await apartment.save()

	res.status(201).json({
		message: 'User registered successfully',
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			phoneNumber: user.phoneNumber,
			role: user.role,
			apartmentId: user.apartmentId,
			apartmentNumber: user.apartmentNumber,
			flatNumber: user.flatNumber,
			flatName: user.flatName
		}
	})
}))

export default router


