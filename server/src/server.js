import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { connectDB } from './config/db.js'
import experimentRoutes from './routes/experiments.js'
import aiRoutes from './routes/ai.js'
import aiRoutes2 from './routes/aiRoutes.js'
import reportRoutes from './routes/report.js'
import { notFound, errorHandler } from './utils/errorHandler.js'

const app = express()
const PORT = env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
connectDB()

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'ChemAI backend running successfully 🚀' })
})

app.get('/api', (req, res) => {
  res.json({ message: 'ChemAI Lab API running' })
})

app.use('/api/experiments', experimentRoutes)
app.use('/api/ask', aiRoutes)
app.use('/api/ai', aiRoutes2)
app.use('/api/report', reportRoutes)

// 404 and error handlers
app.use(notFound)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🧪 ChemAI Lab server running on http://localhost:${PORT}`)
})

