import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { healthRoute } from './routes/health'
import { authRoutes } from './routes/auth'
import { scoringRoutes } from './routes/scoring'
import { reportRoutes } from './routes/reports'
import { competitorRoutes } from './routes/competitors'

async function start() {
  const app = Fastify({ logger: true })

  await app.register(cors, {
    origin: process.env.WEB_URL ?? 'http://localhost:3000',
  })

  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  })

  await app.register(healthRoute)
  await app.register(authRoutes,       { prefix: '/auth' })
  await app.register(scoringRoutes,    { prefix: '/scoring' })
  await app.register(reportRoutes,     { prefix: '/reports' })
  await app.register(competitorRoutes)

  const port = Number(process.env.PORT ?? 3001)
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`🚀 API running at http://localhost:${port}`)
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
