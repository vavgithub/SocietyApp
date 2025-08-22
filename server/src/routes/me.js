import express from 'express'
import { requireAuth } from '../middleware/auth.js'

export const meRouter = express.Router()

meRouter.get('/', requireAuth, (req, res) => {
	return res.json({ user: req.user.toSafeJSON() })
})