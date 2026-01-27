import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import taskRoutes from './routes/tasks.js'
import dependencyRoutes from './routes/dependencies.js'
import projectRoutes from './routes/projects.js'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/tasks', taskRoutes)
app.use('/api/dependencies', dependencyRoutes)
app.use('/api/projects', projectRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 API: http://localhost:${PORT}/api`)
})
