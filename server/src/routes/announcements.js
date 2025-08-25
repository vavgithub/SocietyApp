import express from 'express'
import { asyncHandler } from '../middleware/error.js'
import { requireAuth, requireRoles } from '../middleware/auth.js'
import Announcement from '../models/Announcement.js'
import User from '../models/User.js'

const router = express.Router()

// Get all announcements for the apartment (admin, guard, tenant)
router.get('/', requireAuth, requireRoles(['admin', 'guard', 'tenant']), asyncHandler(async (req, res) => {
	const announcements = await Announcement.find({ 
		apartmentId: req.user.apartmentId,
		isActive: true 
	})
	.populate('createdBy', 'name')
	.sort({ dueDate: 1, createdAt: -1 })

	res.json({ announcements })
}))

// Get upcoming announcements (not past due date)
router.get('/upcoming', requireAuth, requireRoles(['admin', 'guard', 'tenant']), asyncHandler(async (req, res) => {
	const now = new Date()
	const upcomingAnnouncements = await Announcement.find({ 
		apartmentId: req.user.apartmentId,
		isActive: true,
		dueDate: { $gte: now }
	})
	.populate('createdBy', 'name')
	.sort({ dueDate: 1 })
	.limit(5) // Limit to 5 most upcoming

	res.json({ announcements: upcomingAnnouncements })
}))

// Get most recent upcoming announcement for dashboard banner
router.get('/latest-upcoming', requireAuth, requireRoles(['admin', 'guard', 'tenant']), asyncHandler(async (req, res) => {
	const now = new Date()
	const latestAnnouncement = await Announcement.findOne({ 
		apartmentId: req.user.apartmentId,
		isActive: true,
		dueDate: { $gte: now }
	})
	.populate('createdBy', 'name')
	.sort({ dueDate: 1 })

	res.json({ announcement: latestAnnouncement })
}))

// Create new announcement (admin, guard only)
router.post('/', requireAuth, requireRoles(['admin', 'guard']), asyncHandler(async (req, res) => {
	const { title, description, dueDate } = req.body

	// Validation
	if (!title || !description || !dueDate) {
		return res.status(400).json({ message: 'Title, description, and due date are required' })
	}

	// Check if due date is in the future
	const dueDateObj = new Date(dueDate)
	if (dueDateObj <= new Date()) {
		return res.status(400).json({ message: 'Due date must be in the future' })
	}
	const announcement = new Announcement({
		title,
		description,
		dueDate: dueDateObj,
		createdBy: req.user.userId,
		apartmentId: req.user.apartmentId
	})

	await announcement.save()
	await announcement.populate('createdBy', 'name')

	res.status(201).json({ 
		message: 'Announcement created successfully',
		announcement 
	})
}))

// Update announcement (admin, guard only)
router.put('/:id', requireAuth, requireRoles(['admin', 'guard']), asyncHandler(async (req, res) => {
	const { id } = req.params
	const { title, description, dueDate, isActive } = req.body

	const announcement = await Announcement.findOne({ 
		_id: id, 
		apartmentId: req.user.apartmentId 
	})

	if (!announcement) {
		return res.status(404).json({ message: 'Announcement not found' })
	}

	// Update fields
	if (title) announcement.title = title
	if (description) announcement.description = description
	if (dueDate) {
		const dueDateObj = new Date(dueDate)
		if (dueDateObj <= new Date()) {
			return res.status(400).json({ message: 'Due date must be in the future' })
		}
		announcement.dueDate = dueDateObj
	}
	if (typeof isActive === 'boolean') announcement.isActive = isActive

	await announcement.save()
	await announcement.populate('createdBy', 'name')

	res.json({ 
		message: 'Announcement updated successfully',
		announcement 
	})
}))

// Delete announcement (admin, guard only)
router.delete('/:id', requireAuth, requireRoles(['admin', 'guard']), asyncHandler(async (req, res) => {
	const { id } = req.params

	const announcement = await Announcement.findOne({ 
		_id: id, 
		apartmentId: req.user.apartmentId 
	})

	if (!announcement) {
		return res.status(404).json({ message: 'Announcement not found' })
	}

	await announcement.deleteOne()

	res.json({ message: 'Announcement deleted successfully' })
}))

// Toggle announcement status (admin, guard only)
router.patch('/:id/status', requireAuth, requireRoles(['admin', 'guard']), asyncHandler(async (req, res) => {
	const { id } = req.params
	const { isActive } = req.body

	const announcement = await Announcement.findOne({ 
		_id: id, 
		apartmentId: req.user.apartmentId 
	})

	if (!announcement) {
		return res.status(404).json({ message: 'Announcement not found' })
	}

	announcement.isActive = isActive
	await announcement.save()
	await announcement.populate('createdBy', 'name')

	res.json({ 
		message: 'Announcement status updated successfully',
		announcement 
	})
}))

export default router
