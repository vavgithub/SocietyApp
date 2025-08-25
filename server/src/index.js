import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { connectToDatabase } from './lib/db.js'
import authRouter from './routes/auth.js'
import inviteRouter from './routes/invites.js'
import adminRouter from './routes/admin.js'
import tenantRouter from './routes/tenant.js'
import guardRouter from './routes/guard.js'
import announcementRouter from './routes/announcements.js'
import visitorRouter from './routes/visitors.js'
import userRouter from './routes/user.js'
import { notFound, errorHandler } from './middleware/error.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors({
	origin: process.env.FRONTEND_URL || 'http://localhost:5173',
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(morgan('combined'))

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.json({ 
		status: 'OK', 
		message: 'SocietySync API is running',
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || 'development',
		frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
	})
})

// Debug endpoint to check cookies
app.get('/api/debug/cookies', (req, res) => {
	res.json({
		cookies: req.cookies,
		headers: {
			cookie: req.headers.cookie,
			origin: req.headers.origin,
			referer: req.headers.referer
		}
	})
})

// Test endpoint to set a cookie
app.get('/api/debug/set-cookie', (req, res) => {
	res.cookie('test-cookie', 'test-value', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined,
		maxAge: 60 * 1000 // 1 minute
	})
	res.json({ 
		message: 'Test cookie set',
		environment: process.env.NODE_ENV || 'development',
		cookieOptions: {
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
		}
	})
})

// API Routes
app.use('/api/auth', authRouter)
app.use('/api/invites', inviteRouter)
app.use('/api/admin', adminRouter)
app.use('/api/tenant', tenantRouter)
app.use('/api/guard', guardRouter)
app.use('/api/announcements', announcementRouter)
app.use('/api/visitors', visitorRouter)
app.use('/api/user', userRouter)

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Start server
async function startServer() {
	try {
		await connectToDatabase()
		
		
		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`)
			console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
		})
	} catch (error) {
		console.error('❌ Failed to start server:', error)
		process.exit(1)
	}
}

startServer()
