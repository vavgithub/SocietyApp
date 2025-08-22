import { verifyToken } from '../utils/jwt.js'
import { User } from '../models/User.js'

export async function requireAuth(req, res, next) {
	try {
		const authHeader = req.headers['authorization'] || ''
		const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
		if (!token) return res.status(401).json({ error: 'Unauthorized' })
		const payload = verifyToken(token)
		req.auth = payload
		req.user = await User.findById(payload.sub)
		if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
		next()
	} catch (err) {
		return res.status(401).json({ error: 'Unauthorized' })
	}
}

export function requireRole(roles) {
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ error: 'Unauthorized' })
		const allowed = Array.isArray(roles) ? roles : [roles]
		if (!allowed.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' })
		next()
	}
}
