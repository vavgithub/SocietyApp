import express from 'express'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { Invite } from '../models/Invite.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

export const invitesRouter = express.Router()

invitesRouter.post('/', requireAuth, requireRole(['admin']), async (req, res) => {
	try {
		const schema = z.object({ email: z.string().email(), role: z.enum(['tenant','guard']), expiresInDays: z.number().min(1).max(30).optional() })
		const { email, role, expiresInDays } = schema.parse(req.body)
		const token = nanoid(32)
		const days = expiresInDays ?? 7
		const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
		const invite = await Invite.create({ email, role, token, expiresAt, invitedBy: req.user._id })
		return res.json({ invite, link: `/register?token=${token}` })
	} catch (err) {
		return res.status(400).json({ error: err.message })
	}
})

invitesRouter.get('/:token', async (req, res) => {
	const { token } = req.params
	const invite = await Invite.findOne({ token })
	if (!invite) return res.status(404).json({ error: 'Not found' })
	if (invite.usedAt) return res.status(400).json({ error: 'Invite already used' })
	if (invite.expiresAt < new Date()) return res.status(400).json({ error: 'Invite expired' })
	return res.json({ email: invite.email, role: invite.role, expiresAt: invite.expiresAt })
})
