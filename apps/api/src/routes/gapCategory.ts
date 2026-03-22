import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { CompetitorService } from '../services/CompetitorService'

const QuerySchema = z.object({
  lat:      z.coerce.number(),
  lng:      z.coerce.number(),
  radius:   z.coerce.number().min(100).max(20000),
  category: z.string().optional(),
})

// All F&B categories to check
const ALL_CATEGORIES = [
  { id: 'coffee', label: 'Kopi/Cafe', emoji: '☕' },
  { id: 'indonesian', label: 'Makanan Indonesia', emoji: '🍛' },
  { id: 'japanese', label: 'Makanan Jepang', emoji: '🍣' },
  { id: 'chinese', label: 'Makanan China', emoji: '🥡' },
  { id: 'korean', label: 'Makanan Korea', emoji: '🍜' },
  { id: 'western', label: 'Makanan Barat', emoji: '🍔' },
  { id: 'fastfood', label: 'Fast Food', emoji: '🍟' },
  { id: 'bakery', label: 'Bakery', emoji: '🍞' },
  { id: 'seafood', label: 'Sea Food', emoji: '🦐' },
  { id: 'ramen', label: 'Ramen', emoji: '🍜' },
]

export async function gapCategoryRoutes(app: FastifyInstance) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    app.log.warn('GOOGLE_MAPS_API_KEY not set — gap category routes will return mock data')
  }

  const service = apiKey ? new CompetitorService(apiKey) : null

  // GET /gap-category?lat=&lng=&radius=
  app.get('/gap-category', async (request, reply) => {
    try {
      const query = QuerySchema.parse(request.query)

      // Get competitors for each category
      const categoryResults = await Promise.all(
        ALL_CATEGORIES.map(async (cat) => {
          try {
            let competitors: any[] = []
            
            if (!service) {
              // Mock data
              competitors = getMockCompetitorsByCategory(query.lat, query.lng, cat.id)
            } else {
              const results = await service.findNearby({
                lat: query.lat,
                lng: query.lng,
                radius: query.radius,
                category: cat.id,
                maxResults: 10,
              })
              competitors = results
            }

            return {
              category: cat.id,
              label: cat.label,
              emoji: cat.emoji,
              count: competitors.length,
              competitors: competitors.slice(0, 5).map(c => ({
                name: c.name,
                rating: c.rating,
                distance: c.distance,
              })),
            }
          } catch (error) {
            return {
              category: cat.id,
              label: cat.label,
              emoji: cat.emoji,
              count: 0,
              competitors: [],
            }
          }
        })
      )

      // Calculate gap scores
      // Lower count = higher gap (opportunity)
      const maxCount = Math.max(...categoryResults.map(c => c.count))
      const gapAnalysis = categoryResults.map(cat => {
        const gapScore = maxCount === 0 ? 100 : Math.round((1 - cat.count / maxCount) * 100)
        const opportunity = gapScore >= 60 ? 'High' : gapScore >= 30 ? 'Medium' : 'Low'
        
        return {
          ...cat,
          gapScore,
          opportunity,
          recommendation: gapScore >= 60 
            ? `Peluang bagus untuk ${cat.label}` 
            : gapScore >= 30 
              ? `Pasar ${cat.label} cukup ramai`
              : `Persaingan tinggi di ${cat.label}`,
        }
      }).sort((a, b) => b.gapScore - a.gapScore) // Sort by gap (highest first)

      return reply.send({
        ok: true,
        data: {
          categories: gapAnalysis,
          summary: {
            totalCategories: ALL_CATEGORIES.length,
            highOpportunity: gapAnalysis.filter(c => c.opportunity === 'High').length,
            mediumOpportunity: gapAnalysis.filter(c => c.opportunity === 'Medium').length,
            lowOpportunity: gapAnalysis.filter(c => c.opportunity === 'Low').length,
          },
        },
      })
    } catch (err: any) {
      app.log.error(err)
      return reply.code(500).send({ ok: false, error: err.message })
    }
  })
}

// Mock data for gap category
function getMockCompetitorsByCategory(lat: number, lng: number, category: string) {
  // Return different counts based on category for demo
  const mockCounts: Record<string, number> = {
    coffee: 8,
    indonesian: 12,
    japanese: 5,
    chinese: 3,
    korean: 2,
    western: 6,
    fastfood: 4,
    bakery: 2,
    seafood: 1,
    ramen: 1,
  }
  
  const count = mockCounts[category] ?? 1
  return Array.from({ length: count }, (_, i) => ({
    name: `${category} Place ${i + 1}`,
    rating: 3.5 + Math.random() * 1.5,
    distance: Math.round(Math.random() * 800) + 100,
  }))
}
