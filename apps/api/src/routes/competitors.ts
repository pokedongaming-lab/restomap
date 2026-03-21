import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { CompetitorService } from '../services/CompetitorService'

const QuerySchema = z.object({
  lat:      z.coerce.number(),
  lng:      z.coerce.number(),
  radius:   z.coerce.number().min(100).max(5000),
  category: z.string().optional(),
  limit:    z.coerce.number().min(1).max(20).optional(),
})

export async function competitorRoutes(app: FastifyInstance) {
  const apiKey  = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    app.log.warn('GOOGLE_MAPS_API_KEY not set — competitor routes will return mock data')
  }

  const service = apiKey ? new CompetitorService(apiKey) : null

  // GET /competitors?lat=&lng=&radius=&category=
  app.get('/competitors', async (request, reply) => {
    try {
      const query = QuerySchema.parse(request.query)

      if (!service) {
        // Return mock data if no API key
        return reply.send({
          ok: true,
          data: { competitors: getMockCompetitors(query.lat, query.lng), source: 'mock' },
        })
      }

      const competitors = await service.findNearby({
        lat:        query.lat,
        lng:        query.lng,
        radius:     query.radius,
        category:   query.category ?? null,
        maxResults: query.limit ?? 20,
      })

      return reply.send({
        ok: true,
        data: { competitors, total: competitors.length, source: 'google_places' },
      })

    } catch (err: any) {
      app.log.error(err)
      return reply.code(500).send({ ok: false, error: err.message })
    }
  })
}

// ─── Mock data fallback ───────────────────────────────────────────────────────

function getMockCompetitors(lat: number, lng: number) {
  return [
    { placeId: 'mock_1', name: 'Warung Makan Pak Budi', category: 'indonesian', rating: 4.2, priceLevel: 1, address: 'Jl. Contoh No. 1', lat: lat + 0.002, lng: lng + 0.001, distance: 250, isOpen: true,  photoRef: null },
    { placeId: 'mock_2', name: 'Kafe Menteng',          category: 'coffee',     rating: 4.5, priceLevel: 2, address: 'Jl. Contoh No. 2', lat: lat - 0.001, lng: lng + 0.003, distance: 420, isOpen: true,  photoRef: null },
    { placeId: 'mock_3', name: 'Restoran Padang Jaya',  category: 'indonesian', rating: 3.9, priceLevel: 1, address: 'Jl. Contoh No. 3', lat: lat + 0.003, lng: lng - 0.002, distance: 580, isOpen: false, photoRef: null },
    { placeId: 'mock_4', name: 'Pizza Corner',          category: 'western',    rating: 4.1, priceLevel: 2, address: 'Jl. Contoh No. 4', lat: lat - 0.002, lng: lng - 0.001, distance: 710, isOpen: true,  photoRef: null },
    { placeId: 'mock_5', name: 'Sushi Tei',             category: 'japanese',   rating: 4.7, priceLevel: 3, address: 'Jl. Contoh No. 5', lat: lat + 0.004, lng: lng + 0.002, distance: 890, isOpen: true,  photoRef: null },
  ]
}
