import express from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { User } from '../models/User.js'
import { Invite } from '../models/Invite.js'
import { signUserToken } from '../utils/jwt.js'

export const authRouter = express.Router()

authRouter.post('/login', async (req, res) => {
	try {
		const schema = z.object({ email: z.string().email(), password: z.string().min(6) })
		const { email, password } = schema.parse(req.body)
		const user = await User.findOne({ email })
		if (!user) return res.status(400).json({ error: 'Invalid credentials' })
		const ok = await bcrypt.compare(password, user.passwordHash)
		if (!ok) return res.status(400).json({ error: 'Invalid credentials' })
		const token = signUserToken(user)
		return res.json({ token, user: user.toSafeJSON() })
	} catch (err) {
		return res.status(400).json({ error: err.message })
	}
})

authRouter.post('/register', async (req, res) => {
	try {
		const schema = z.object({ token: z.string().min(10), name: z.string().min(2), password: z.string().min(6), phone: z.string().optional() })
		const { token, name, password, phone } = schema.parse(req.body)
		const invite = await Invite.findOne({ token })
		if (!invite) return res.status(400).json({ error: 'Invalid invite' })
		if (invite.usedAt) return res.status(400).json({ error: 'Invite already used' })
		if (invite.expiresAt < new Date()) return res.status(400).json({ error: 'Invite expired' })
		const existing = await User.findOne({ email: invite.email })
		if (existing) return res.status(400).json({ error: 'User already exists' })
		const passwordHash = await bcrypt.hash(password, 10)
		const user = await User.create({
			name,
			email: invite.email,
			phone,
			role: invite.role,
			passwordHash
		})
		invite.usedAt = new Date()
		await invite.save()
		const jwt = signUserToken(user)
		return res.json({ token: jwt, user: user.toSafeJSON() })
	} catch (err) {
		return res.status(400).json({ error: err.message })
	}
})

