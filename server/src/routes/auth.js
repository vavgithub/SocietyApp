import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { asyncHandler } from '../middleware/error.js'
import { requireAuth } from '../middleware/auth.js'
import User from '../models/User.js'
import Apartment from '../models/Apartment.js'
import { generateOTP, storeOTP, verifyOTP, sendOTP } from '../lib/otpManager.js'

const router = express.Router()

// Request OTP for admin registration
router.post('/request-admin-otp', [
	body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], asyncHandler(async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
	}

	const { email } = req.body

	// Check if user already exists
	const existingUser = await User.findOne({ email })
	if (existingUser) {
		return res.status(400).json({ message: 'User with this email already exists' })
	}

	// Generate and store OTP
	const otp = generateOTP()
	storeOTP(email, otp, 'admin-registration')

	// Send OTP via email
	const emailResult = await sendOTP(email, otp, 'admin-registration')
	
	if (!emailResult.success) {
		return res.status(500).json({ message: 'Failed to send OTP. Please try again.' })
	}

	res.json({ 
		message: 'OTP sent successfully to your email',
		email: email
	})
}))

// Register admin and create apartment (with OTP verification)
router.post('/register-admin', [
	body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
	body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
	body('password')
		.isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
		.matches(/^(?=.*[a-zA-Z])(?=.*\d)/).withMessage('Password must contain both letters and numbers'),
	body('societyName').trim().isLength({ min: 2 }).withMessage('Society name must be at least 2 characters'),
	body('societyAddress').trim().isLength({ min: 5 }).withMessage('Society address must be at least 5 characters'),
	body('housingType').isIn(['villa', 'flat']).withMessage('Housing type must be either villa or flat'),
	body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], asyncHandler(async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
	}

	const { name, email, password, societyName, societyAddress, housingType, otp } = req.body

	// Check if user already exists
	const existingUser = await User.findOne({ email })
	if (existingUser) {
		return res.status(400).json({ message: 'User with this email already exists' })
	}

	// Verify OTP
	const otpVerification = verifyOTP(email, otp, 'admin-registration')
	if (!otpVerification.valid) {
		return res.status(400).json({ message: otpVerification.message })
	}

	// Hash password
	const saltRounds = 12
	const passwordHash = await bcrypt.hash(password, saltRounds)

	// Create user
	const user = new User({
		name,
		email,
		passwordHash,
		role: 'admin',
		isActive: true
	})

	await user.save()

	// Create apartment
	const apartment = new Apartment({
		name: societyName,
		address: societyAddress,
		housingType,
		adminId: user._id,
		isEnrollmentComplete: false
	})

	await apartment.save()

	// Update user with apartmentId
	user.apartmentId = apartment._id
	await user.save()

	// Generate JWT token
	const token = jwt.sign(
		{ userId: user._id, role: user.role, apartmentId: apartment._id },
		process.env.JWT_SECRET,
		{ expiresIn: '7d' }
	)

	// Set cookie with environment-specific settings
	res.cookie('userToken', token, {
		httpOnly: false, // Allow frontend to read the cookie
		secure: process.env.NODE_ENV === 'production',
		sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
	})

	res.status(201).json({
		message: 'Admin account and society created successfully',
		user: {
			id: user._id,
			name: user.name,
			email: user.email,
			phoneNumber: user.phoneNumber,
			role: user.role,
			apartmentId: apartment._id,
			apartmentNumber: user.apartmentNumber,
			flatNumber: user.flatNumber,
			flatName: user.flatName
		},
		apartment: {
			id: apartment._id,
			name: apartment.name,
			address: apartment.address,
			housingType: apartment.housingType,
			isEnrollmentComplete: apartment.isEnrollmentComplete
		}
	})
}))

// Login
router.post('/login', [
	body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
	body('password').notEmpty().withMessage('Password is required')
], asyncHandler(async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
	}

	const { email, password } = req.body

	// Find user
	const user = await User.findOne({ email }).populate('apartmentId')
	if (!user) {
		return res.status(401).json({ message: 'Invalid email or password' })
	}

	// Check if user is active
	if (!user.isActive) {
		return res.status(401).json({ message: 'Account is deactivated' })
	}

	// Verify password
	const isPasswordValid = await user.comparePassword(password)
	if (!isPasswordValid) {
		return res.status(401).json({ message: 'Invalid email or password' })
	}

	// Generate JWT token
	const token = jwt.sign(
		{ userId: user._id, role: user.role, apartmentId: user.apartmentId },
		process.env.JWT_SECRET,
		{ expiresIn: '7d' }
	)

	// Set cookie with environment-specific settings
	res.cookie('userToken', token, {
		httpOnly: false, // Allow frontend to read the cookie
		secure: process.env.NODE_ENV === 'production',
		sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
	})

	res.json({
		message: 'Login successful',
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

// Logout
router.post('/logout', asyncHandler(async (req, res) => {
	res.clearCookie('userToken', {
		httpOnly: false,
		secure: process.env.NODE_ENV === 'production',
		sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
	})
	res.json({ message: 'Logout successful' })
}))

// Get current user
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
	const user = await User.findById(req.user.userId).populate('apartmentId')
	if (!user) {
		return res.status(404).json({ message: 'User not found' })
	}

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
			flatName: user.flatName
		}
	})
}))

export default router


