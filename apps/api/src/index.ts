import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { healthRoute } from './routes/health'
import { authRoutes } from './routes/auth'
import { scoringRoutes } from './routes/scoring'
import { reportRoutes } from './routes/reports'
import { competitorRoutes } from './routes/competitors'
import { savedLocationsRoutes } from './routes/locations'
import { heatmapRoutes } from './routes/heatmap'
import { gapCategoryRoutes } from './routes/gapCategory'
import { cityAverageRoutes } from './routes/cityAverage'

async function start() {
  const app = Fastify({ logger: true })

  await app.register(cors, {
    origin: true, // Allow all origins for development
  })

  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  })

  await app.register(healthRoute)
  await app.register(authRoutes,       { prefix: '/auth' })
  await app.register(scoringRoutes,    { prefix: '/scoring' })
  await app.register(reportRoutes,     { prefix: '/reports' })
  await app.register(competitorRoutes)
  await app.register(savedLocationsRoutes)
  await app.register(heatmapRoutes)
  await app.register(gapCategoryRoutes)
  await app.register(cityAverageRoutes)

  const port = Number(process.env.PORT ?? 3001)
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`🚀 API running at http://localhost:${port}`)
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
