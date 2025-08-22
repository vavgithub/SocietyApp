import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { connectToDatabase } from './config/db.js'
import { authRouter } from './routes/auth.js'
import { invitesRouter } from './routes/invites.js'
import bcrypt from 'bcryptjs'
import { User } from './models/User.js'
import { meRouter } from './routes/me.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
	res.json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/invites', invitesRouter)
app.use('/api/me', meRouter)

async function ensureAdminSeed() {
	const email = process.env.ADMIN_EMAIL
	const password = process.env.ADMIN_PASSWORD
	const name = process.env.ADMIN_NAME || 'Society Admin'
	if (!email || !password) return
	const existing = await User.findOne({ email })
	if (existing) return
	const passwordHash = await bcrypt.hash(password, 10)
	await User.create({ name, email, role: 'admin', passwordHash })
	console.log('Seeded initial admin:', email)
}

async function start() {
	await connectToDatabase(process.env.MONGODB_URI)
	await ensureAdminSeed()
	app.listen(PORT, () => {
		console.log(`Server listening on http://localhost:${PORT}`)
	})
}

start().catch((err) => {
	console.error(err)
	process.exit(1)
})
