import mongoose from 'mongoose'

export async function connectToDatabase() {
	try {
		const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/societysync'
		await mongoose.connect(mongoUri)
		console.log('✅ Connected to MongoDB successfully')
	} catch (error) {
		console.error('❌ MongoDB connection error:', error)
		process.exit(1)
	}
}

export default connectToDatabase


