import Fastify from 'fastify'
import { z } from 'zod'

const WeightsSchema = z.object({
  population:  z.number().min(0).max(100),
  traffic:     z.number().min(0).max(100),
  income:      z.number().min(0).max(100),
  competition: z.number().min(0).max(100),
  parking:     z.number().min(0).max(100),
  rent:        z.number().min(0).max(100),
})

const CalculateSchema = z.object({
  lat:     z.number(),
  lng:     z.number(),
  radius:  z.number().min(100).max(5000),
  weights: WeightsSchema,
})

export async function scoringRoutes(app: any) {
  app.post('/calculate', async (request: any, reply: any) => {
    try {
      const input = CalculateSchema.parse(request.body)
      // TODO: wire to LocationScoringEngine in issue #14
      return { ok: true, data: { total: 50, breakdown: input.weights, missing_factors: [], confidence: 'high' } }
    } catch (err) {
      return reply.code(400).send({ ok: false, error: 'Invalid input' })
    }
  })
}