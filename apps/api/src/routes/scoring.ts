import Fastify from 'fastify'
import { z } from 'zod'
import { LocationScoringEngineImpl } from '@restomap/scoring'

const WeightsSchema = z.object({
  population:  z.number().min(0).max(100),
  traffic:     z.number().min(0).max(100),
  income:      z.number().min(0).max(100),
  competition: z.number().min(0).max(100),
  parking:     z.number().min(0).max(100),
  rent:        z.number().min(0).max(100),
})

const CalculateSchema = z.object({
  lat:     z.number().min(-90).max(90),
  lng:     z.number().min(-180).max(180),
  radius:  z.number().min(100).max(5000),
  weights: WeightsSchema,
})

export async function scoringRoutes(app: Fastify.FastifyInstance) {
  const scoringEngine = new LocationScoringEngineImpl()

  // POST /scoring/calculate
  app.post('/calculate', async (request, reply) => {
    try {
      const input = CalculateSchema.parse(request.body)

      const result = await scoringEngine.calculate({
        lat: input.lat,
        lng: input.lng,
        radius: input.radius,
        weights: input.weights,
      })

      return reply.send({
        ok: true,
        data: {
          total: result.total,
          breakdown: result.breakdown,
          missing_factors: result.missing_factors,
          confidence: result.confidence,
        },
      })
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return reply.code(400).send({ ok: false, error: 'VALIDATION_ERROR', details: err.errors })
      }
      if (err.message?.includes('Weights must sum to 100')) {
        return reply.code(400).send({ ok: false, error: 'INVALID_WEIGHTS', message: err.message })
      }
      app.log.error(err)
      return reply.code(500).send({ ok: false, error: 'INTERNAL_ERROR' })
    }
  })

  // GET /scoring/factors - list available scoring factors
  app.get('/factors', async () => {
    return {
      ok: true,
      data: {
        factors: [
          { key: 'population', label: 'Kepadatan Penduduk', description: 'Density of population in area' },
          { key: 'traffic', label: 'Traffic', description: 'Traffic density and accessibility' },
          { key: 'income', label: 'Daya Beli', description: 'Average income in the area' },
          { key: 'competition', label: 'Kompetitor', description: 'Number of competitors nearby' },
          { key: 'parking', label: 'Parkir', description: 'Parking availability' },
          { key: 'rent', label: 'Harga Sewa', description: 'Rental cost in the area' },
        ],
      },
    }
  })
}
