import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      tls: true,
      tlsAllowInvalidCertificates: true, // bypass Windows SSL issues
      retryWrites: true,
    })
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (err) {
    console.error('❌ DB connection failed:', err.message)
    // Don't exit in development, allow graceful degradation
    console.log('⚠️ Continuing without database connection')
  }
}



