import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export function requireAuth(req, res, next) {
	const token = req.cookies.userToken

	if (!token) {
		return res.status(401).json({ message: 'Access denied. No token provided.' })
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		req.user = decoded
		next()
	} catch (error) {
		return res.status(401).json({ message: 'Invalid token.' })
	}
}

export function requireRoles(allowedRoles) {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ message: 'Access denied. No token provided.' })
		}

		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Access denied. Insufficient permissions.' })
		}

		next()
	}
}


