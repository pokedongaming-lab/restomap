import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getLocationFactors } from '../services/BPSService'

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

type ScoringResult = {
  total: number | null
  breakdown: Record<string, number | null>
  missing_factors: string[]
  confidence: string
}

// Simple scoring engine
function calculateScore(weights: Record<string, number>, factors: Record<string, number>): ScoringResult {
  const breakdown: Record<string, number | null> = {}
  const missing_factors: string[] = []
  
  let total = 0
  let weightSum = 0
  
  for (const [key, weight] of Object.entries(weights)) {
    const factor = factors[key]
    if (factor !== undefined) {
      breakdown[key] = Math.round((factor / 100) * weight)
      total += breakdown[key]!
    } else {
      breakdown[key] = null
      missing_factors.push(key)
    }
    weightSum += weight
  }
  
  // Scale to 100
  if (weightSum > 0) {
    total = Math.round((total / weightSum) * 100)
  }
  
  return {
    total: missing_factors.length > 0 ? null : total,
    breakdown,
    missing_factors,
    confidence: missing_factors.length === 0 ? 'high' : 'medium',
  }
}

export async function scoringRoutes(app: FastifyInstance) {

  // POST /scoring/calculate
  app.post('/calculate', async (request, reply) => {
    try {
      const input = CalculateSchema.parse(request.body)

      // Get BPS factors
      let bpsFactors = {
        population: 50,
        income: 50,
        traffic: 50,
        competition: 50,
      }
      
      try {
        bpsFactors = await getLocationFactors(input.lat, input.lng, input.radius)
      } catch (bpsError) {
        app.log.warn('BPS API error, using default values')
      }

      const factors = {
        population: bpsFactors.population,
        income: bpsFactors.income,
        traffic: bpsFactors.traffic,
        competition: bpsFactors.competition,
        parking: 50,
        rent: 50,
      }

      const result = calculateScore(input.weights, factors)

      return reply.send({
        ok: true,
        data: {
          total: result.total,
          breakdown: result.breakdown,
          missing_factors: result.missing_factors,
          confidence: result.confidence,
          source: {
            population: 'bps_api',
            income: 'bps_api',
            traffic: 'estimated',
            competition: 'google_places',
            parking: 'estimated',
            rent: 'estimated',
          },
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

  // GET /scoring/factors
  app.get('/factors', async () => {
    return {
      ok: true,
      data: {
        factors: [
          { key: 'population', label: 'Kepadatan Penduduk', description: 'Density of population in area (来自 BPS Indonesia)', source: 'bps' },
          { key: 'traffic', label: 'Traffic', description: 'Traffic density and accessibility', source: 'estimated' },
          { key: 'income', label: 'Daya Beli', description: 'Average income in the area (来自 BPS Indonesia)', source: 'bps' },
          { key: 'competition', label: 'Kompetitor', description: 'Number of competitors nearby', source: 'google_places' },
          { key: 'parking', label: 'Parkir', description: 'Parking availability', source: 'estimated' },
          { key: 'rent', label: 'Harga Sewa', description: 'Rental cost in the area', source: 'estimated' },
        ],
      },
    }
  })

  // GET /scoring/regions
  app.get('/regions', async (request, reply) => {
    try {
      const provinces = await getLocationFactors(-6.2, 106.8, 1000)
      return reply.send({
        ok: true,
        data: { message: 'Use /heatmap/regions instead' },
      })
    } catch (err: any) {
      app.log.error(err)
      return reply.code(500).send({ ok: false, error: 'Failed to fetch regions' })
    }
  })
}
