import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export function signUserToken(user) {
	if (!JWT_SECRET) throw new Error('JWT_SECRET not set')
	return jwt.sign({
		sub: user._id.toString(),
		role: user.role,
		email: user.email,
		name: user.name
	}, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
	if (!JWT_SECRET) throw new Error('JWT_SECRET not set')
	return jwt.verify(token, JWT_SECRET)
}
