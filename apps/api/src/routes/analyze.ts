import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { calculateRevenue, RESTAURANT_TYPES } from '../lib/revenue'

// Feasibility Score Calculation
interface FeasibilityInput {
  city: string
  zone: string
  restaurantType: string
  competition: number
  revenue: number
  profit: number
  breakEvenMonths: number
}

interface FeasibilityResult {
  score: number
  rating: 'Excellent' | 'Good' | 'Moderate' | 'Risky' | 'Not Recommended'
  breakdown: Record<string, { label: string; score: number; max: number }>
  recommendation: string[]
}

async function calculateFeasibilityScore(input: FeasibilityInput): Promise<FeasibilityResult> {
  const breakdown: Record<string, { label: string; score: number; max: number }> = {}
  
  // 1. Financial Health (30%)
  const profitMargin = input.revenue > 0 ? (input.profit / input.revenue) * 100 : 0
  const financialScore = Math.min(100, Math.max(0, profitMargin * 4)) // 25% margin = 100
  breakdown.financial = { label: 'Kesehatan Keuangan', score: Math.round(financialScore), max: 100 }
  
  // 2. Break-even Time (25%)
  const breakEvenScore = Math.min(100, Math.max(0, (24 - input.breakEvenMonths) / 24 * 100))
  breakdown.breakeven = { label: 'Waktu Break-Even', score: Math.round(breakEvenScore), max: 100 }
  
  // 3. Market Demand (25%) - based on city tier
  const cityDemand: Record<string, number> = {
    'jakarta': 95,
    'surabaya': 85,
    'bandung': 80,
    'bali': 85,
    'medan': 70,
    'makassar': 65,
    'semarang': 60,
    'yogyakarta': 70
  }
  const marketScore = cityDemand[input.city.toLowerCase()] || 50
  breakdown.market = { label: 'Permintaan Pasar', score: marketScore, max: 100 }
  
  // 4. Competition (20%)
  let competitionScore = 100
  if (input.competition > 30) competitionScore = 100 - (input.competition - 30) * 1.5
  if (input.competition > 50) competitionScore = 70 - (input.competition - 50) * 2
  competitionScore = Math.max(0, Math.min(100, competitionScore))
  breakdown.competition = { label: 'Tingkat Kompetisi', score: Math.round(competitionScore), max: 100 }
  
  // Calculate total score
  const totalScore = Math.round(
    breakdown.financial.score * 0.30 +
    breakdown.breakeven.score * 0.25 +
    breakdown.market.score * 0.25 +
    breakdown.competition.score * 0.20
  )
  
  // Rating
  let rating: FeasibilityResult['rating']
  if (totalScore >= 80) rating = 'Excellent'
  else if (totalScore >= 65) rating = 'Good'
  else if (totalScore >= 50) rating = 'Moderate'
  else if (totalScore >= 35) rating = 'Risky'
  else rating = 'Not Recommended'
  
  // Generate recommendations
  const recommendation: string[] = []
  if (breakdown.financial.score < 60) {
    recommendation.push('Pertimbangkan untuk menurunkan biaya operasional atau meningkatkan harga rata-rata')
  }
  if (breakdown.breakeven.score < 50) {
    recommendation.push('Modal mungkin memakan waktu lama untuk kembali. Evaluasi again strategi pricing')
  }
  if (breakdown.competition.score < 50) {
    recommendation.push('Area ini sudah sangat kompetitif. Pertimbangkan lokasi lain atau diferensiasi konsep')
  }
  if (totalScore >= 70) {
    recommendation.push('Lokasi ini layak dipertimbangkan untuk investasi restoran')
  }
  
  return {
    score: totalScore,
    rating,
    breakdown,
    recommendation
  }
}

const AnalyzeSchema = z.object({
  city: z.string().min(1),
  country: z.string().default('Indonesia'),
  zone: z.string().default('default'),
  restaurantType: z.string(),
  competition: z.number().min(0).max(100).default(10),
  budget: z.number().optional(),
  seatingSize: z.number().min(10).max(500).optional(),
  notes: z.string().optional(),
})

interface AnalyzeInput {
  city: string
  country: string
  zone: string
  restaurantType: string
  competition: number
  budget?: number
  seatingSize?: number
  notes?: string
}

interface AnalyzeResult {
  id: string
  createdAt: string
  input: {
    city: string
    country: string
    zone: string
    restaurantType: string
    competition: number
  }
  revenue: {
    daily: { covers: number; revenue: number }
    monthly: { revenue: number; operatingCost: number; estimatedRent: number; profit: number }
    annual: { revenue: number; profit: number }
    avgCheck: number
    startupCost: number
    breakEvenMonths: number
  }
  feasibility: {
    score: number
    rating: 'Excellent' | 'Good' | 'Moderate' | 'Risky' | 'Not Recommended'
    breakdown: Record<string, { label: string; score: number; max: number }>
    recommendation: string[]
  }
  enrichment: {
    sources: string[]
    nearbyRestaurants?: { count: number }
    bpsCity?: { population: number }
    geo?: { formattedAddress: string }
  }
}

// Mock Google Places data
function mockNearbyRestaurants(city: string, competition: number) {
  // Base on competition input but add some randomness
  const baseCount = Math.max(3, Math.min(25, competition + Math.floor(Math.random() * 10) - 5))
  return {
    count: baseCount
  }
}

// Mock BPS city data
function mockBPSCityData(city: string) {
  const cityPopulation: Record<string, number> = {
    'jakarta': 10562088,
    'surabaya': 2846719,
    'bandung': 2575478,
    'medan': 2235369,
    'makassar': 1430696,
    'semarang': 1800000,
    'yogyakarta': 4013525,
    'bali': 4225384,
  }
  
  const key = city.toLowerCase()
  return {
    population: cityPopulation[key] || 1000000 + Math.floor(Math.random() * 2000000)
  }
}

export async function analyzeRoutes(app: FastifyInstance) {
  
  // GET /api/meta
  app.get('/meta', async () => {
    return {
      success: true,
      data: {
        restaurantTypes: RESTAURANT_TYPES.map(t => ({
          value: t.value,
          label: t.label,
          breakEvenMonths: t.breakEvenMonths,
          avgCheckRange: t.avgCheckRange
        }))
      }
    }
  })
  
  // GET /api/health
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  })
  
  // POST /api/analyze
  app.post('/analyze', async (request, reply) => {
    try {
      const input = AnalyzeSchema.parse(request.body)
      
      const seatingSize = input.seatingSize || 50
      
      // Calculate revenue
      const revenue = calculateRevenue({
        city: input.city,
        zone: input.zone,
        restaurantType: input.restaurantType,
        competition: input.competition,
        seatingSize
      })
      
      // Calculate feasibility score
      const feasibility = await calculateFeasibilityScore({
        city: input.city,
        zone: input.zone,
        restaurantType: input.restaurantType,
        competition: input.competition,
        revenue: revenue.monthly.revenue,
        profit: revenue.monthly.profit,
        breakEvenMonths: revenue.breakEvenMonths
      })
      
      // Mock enrichment data
      const nearbyRestaurants = mockNearbyRestaurants(input.city, input.competition)
      const bpsCity = mockBPSCityData(input.city)
      
      const result: AnalyzeResult = {
        id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        input: {
          city: input.city,
          country: input.country,
          zone: input.zone,
          restaurantType: input.restaurantType,
          competition: input.competition
        },
        revenue,
        feasibility,
        enrichment: {
          sources: ['google_places', 'bps'],
          nearbyRestaurants,
          bpsCity,
          geo: {
            formattedAddress: `${input.city}, ${input.country}`
          }
        }
      }
      
      // Simpan ke database jika user terautentikasi
      // const userId = request.user?.id // dari auth middleware
      // if (userId) {
      //   await prisma.analysis.create({...})
      // }
      
      return reply.send({
        success: true,
        data: result
      })
      
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return reply.code(400).send({
          success: false,
          error: 'VALIDATION_ERROR',
          details: err.errors
        })
      }
      app.log.error(err)
      return reply.code(500).send({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Terjadi kesalahan saat analisis lokasi'
      })
    }
  })
  
  // POST /api/compare
  app.post('/compare', async (request, reply) => {
    try {
      const body = request.body as {
        locationA: z.infer<typeof AnalyzeSchema>
        locationB: z.infer<typeof AnalyzeSchema>
      }
      
      const inputA = AnalyzeSchema.parse(body.locationA)
      const inputB = AnalyzeSchema.parse(body.locationB)
      
      const resultA = calculateRevenue({
        city: inputA.city,
        zone: inputA.zone,
        restaurantType: inputA.restaurantType,
        competition: inputA.competition,
        seatingSize: inputA.seatingSize || 50
      })
      
      const resultB = calculateRevenue({
        city: inputB.city,
        zone: inputB.zone,
        restaurantType: inputB.restaurantType,
        competition: inputB.competition,
        seatingSize: inputB.seatingSize || 50
      })
      
      return reply.send({
        success: true,
        data: {
          locationA: { input: inputA, revenue: resultA },
          locationB: { input: inputB, revenue: resultB }
        }
      })
      
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return reply.code(400).send({
          success: false,
          error: 'VALIDATION_ERROR',
          details: err.errors
        })
      }
      app.log.error(err)
      return reply.code(500).send({
        success: false,
        error: 'INTERNAL_ERROR'
      })
    }
  })
  
  // POST /api/whatif
  app.post('/whatif', async (request, reply) => {
    try {
      const body = request.body as {
        city: string
        restaurantType: string
        zone: string
        competition: number
        seatingSize?: number
        avgCheckOverride?: number
        cogsOverride?: number
        occupancyOverride?: number
      }
      
      const baseInput = {
        city: body.city,
        zone: body.zone || 'default',
        restaurantType: body.restaurantType,
        competition: body.competition,
        seatingSize: body.seatingSize || 50,
        avgCheckOverride: body.avgCheckOverride
      }
      
      const scenarios = [
        { label: 'Optimistis', avgCheckOverride: body.avgCheckOverride ? body.avgCheckOverride * 1.2 : undefined, occupancyOverride: 0.85 },
        { label: 'Konservatif', avgCheckOverride: body.avgCheckOverride ? body.avgCheckOverride * 0.8 : undefined, occupancyOverride: 0.5 },
        { label: 'Peningkatan Occupancy', occupancyOverride: 0.8 },
      ]
      
      const { calculateWhatIf } = await import('../lib/revenue')
      const result = calculateWhatIf(baseInput, scenarios)
      
      // Calculate feasibility for base
      const baseRevenue = calculateRevenue(baseInput)
      const feasibility = await calculateFeasibilityScore({
        city: body.city,
        zone: body.zone,
        restaurantType: body.restaurantType,
        competition: body.competition,
        revenue: baseRevenue.monthly.revenue,
        profit: baseRevenue.monthly.profit,
        breakEvenMonths: baseRevenue.breakEvenMonths
      })
      
      return reply.send({
        success: true,
        data: {
          base: { revenue: baseRevenue.monthly.revenue, feasibility },
          scenarios: result.scenarios
        }
      })
      
    } catch (err: any) {
      app.log.error(err)
      return reply.code(500).send({
        success: false,
        error: 'INTERNAL_ERROR'
      })
    }
  })
  
  // GET /api/history (requires auth)
  app.get('/history', async (request, reply) => {
    // Placeholder - requires auth middleware
    // const userId = request.user.id
    // const analyses = await prisma.analysis.findMany({ where: { userId } })
    
    return reply.send({
      success: true,
      data: []
    })
  })
  
  // DELETE /api/history/:id (requires auth)
  app.delete('/history/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    
    // Placeholder - requires auth middleware
    // await prisma.analysis.delete({ where: { id } })
    
    return reply.send({
      success: true,
      message: 'Analysis deleted'
    })
  })
}
