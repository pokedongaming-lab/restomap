import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

async function start() {
  // Load env from repo root first, then fallback to local cwd
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const rootEnv = path.resolve(__dirname, '../../../.env')
  dotenv.config({ path: rootEnv })
  dotenv.config()

  const healthModule = await import('./routes/health')
  const healthRoute = healthModule.healthRoute
  const { authRoutes } = await import('./routes/auth')
  const { scoringRoutes } = await import('./routes/scoring')
  const { reportRoutes } = await import('./routes/reports')
  const { competitorRoutes } = await import('./routes/competitors')
  const { savedLocationsRoutes } = await import('./routes/locations')
  const { heatmapRoutes } = await import('./routes/heatmap')
  const { gapCategoryRoutes } = await import('./routes/gapCategory')
  const { cityAverageRoutes } = await import('./routes/cityAverage')
  const { sentimentRoutes } = await import('./routes/sentiment')
  const { quadrantRoutes } = await import('./routes/quadrant')
  const { bayesianRoutes } = await import('./routes/bayesian')
  const { analyzeRoutes } = await import('./routes/analyze')
  const { rebRoutes } = await import('./routes/reb')

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
  await app.register(sentimentRoutes)
  await app.register(quadrantRoutes)
  await app.register(bayesianRoutes)
  await app.register(analyzeRoutes, { prefix: '/analyze' })
  await app.register(rebRoutes, { prefix: '/reb' })

  const port = Number(process.env.PORT ?? 3001)
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`🚀 API running at http://localhost:${port}`)
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
