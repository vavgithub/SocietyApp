import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
	res.json({ status: 'ok' })
})

app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`)
})
