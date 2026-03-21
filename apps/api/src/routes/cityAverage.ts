import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

// City average data (mock data for now - can be expanded with real data)
const CITY_AVERAGES: Record<string, {
  population: number
  traffic: number
  income: number
  competition: number
  parking: number
  rent: number
  avgScore: number
}> = {
  jakarta: { population: 75, traffic: 60, income: 80, competition: 70, parking: 40, rent: 85, avgScore: 68 },
  surabaya: { population: 70, traffic: 55, income: 75, competition: 65, parking: 50, rent: 70, avgScore: 64 },
  bandung: { population: 60, traffic: 45, income: 65, competition: 55, parking: 60, rent: 55, avgScore: 57 },
  bali: { population: 45, traffic: 50, income: 70, competition: 60, parking: 45, rent: 65, avgScore: 56 },
  medan: { population: 55, traffic: 40, income: 50, competition: 45, parking: 35, rent: 45, avgScore: 45 },
  makassar: { population: 50, traffic: 35, income: 45, competition: 40, parking: 30, rent: 40, avgScore: 40 },
  semarang: { population: 45, traffic: 35, income: 45, competition: 40, parking: 35, rent: 40, avgScore: 40 },
  yogyakarta: { population: 45, traffic: 40, income: 50, competition: 45, parking: 40, rent: 45, avgScore: 44 },
  solo: { population: 40, traffic: 30, income: 40, competition: 35, parking: 30, rent: 35, avgScore: 35 },
  palembang: { population: 45, traffic: 30, income: 40, competition: 35, parking: 25, rent: 35, avgScore: 35 },
  tangerang: { population: 60, traffic: 50, income: 60, competition: 55, parking: 35, rent: 60, avgScore: 53 },
  bekasi: { population: 65, traffic: 45, income: 55, competition: 50, parking: 30, rent: 55, avgScore: 50 },
  depok: { population: 55, traffic: 40, income: 55, competition: 45, parking: 35, rent: 50, avgScore: 47 },
  bogor: { population: 40, traffic: 35, income: 50, competition: 40, parking: 40, rent: 45, avgScore: 42 },
}

const QuerySchema = z.object({
  city: z.string().optional(),
})

export async function cityAverageRoutes(app: FastifyInstance) {
  // GET /city-average - Get all city averages
  app.get('/city-average', async (request, reply) => {
    try {
      const query = QuerySchema.parse(request.query)
      
      const cities = Object.entries(CITY_AVERAGES).map(([key, value]) => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        ...value,
      })).sort((a, b) => b.avgScore - a.avgScore)

      if (query.city) {
        const cityData = CITY_AVERAGES[query.city.toLowerCase()]
        if (!cityData) {
          return reply.code(404).send({ ok: false, error: 'City not found' })
        }
        return reply.send({
          ok: true,
          data: {
            city: query.city,
            ...cityData,
          },
        })
      }

      return reply.send({
        ok: true,
        data: { cities },
      })
    } catch (err: any) {
      app.log.error(err)
      return reply.code(500).send({ ok: false, error: err.message })
    }
  })

  // GET /city-average/compare?city=&score= - Compare score with city average
  app.get('/city-average/compare', async (request, reply) => {
    try {
      const { city, score } = request.query as { city?: string; score?: string }
      
      if (!city || !score) {
        return reply.code(400).send({ ok: false, error: 'city and score are required' })
      }

      const cityData = CITY_AVERAGES[city.toLowerCase()]
      if (!cityData) {
        return reply.code(404).send({ ok: false, error: 'City not found' })
      }

      const userScore = parseFloat(score)
      if (isNaN(userScore)) {
        return reply.code(400).send({ ok: false, error: 'Invalid score' })
      }

      const diff = userScore - cityData.avgScore
      const comparison = diff > 5 ? 'above' : diff < -5 ? 'below' : 'average'

      return reply.send({
        ok: true,
        data: {
          userScore,
          cityAverage: cityData.avgScore,
          difference: diff,
          comparison,
          message: comparison === 'above' 
            ? `Skor kamu ${diff.toFixed(1)} di atas rata-rata ${city}` 
            : comparison === 'below'
              ? `Skor kamu ${Math.abs(diff).toFixed(1)} di bawah rata-rata ${city}`
              : `Skor kamu setara dengan rata-rata ${city}`,
        },
      })
    } catch (err: any) {
      app.log.error(err)
      return reply.code(500).send({ ok: false, error: err.message })
    }
  })
}
