import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { CompetitorService } from '../services/CompetitorService'

const QuerySchema = z.object({
  lat:      z.coerce.number(),
  lng:      z.coerce.number(),
  radius:   z.coerce.number().min(100).max(10000),
  category: z.string().optional(),
  limit:    z.coerce.number().min(1).max(50).optional(),
  brand:    z.string().optional(), // Search for specific brand
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
          data: { competitors: getMockCompetitors(query.lat, query.lng, query.category), source: 'mock' },
        })
      }

      const competitors = await service.findNearby({
        lat:        query.lat,
        lng:        query.lng,
        radius:     query.radius,
        category:   query.category ?? null,
        maxResults: query.limit ?? 20,
        keyword:    query.brand ?? undefined,
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

  // GET /competitors/brands?lat=&lng=&radius= - Search for famous brand chains
  app.get('/competitors/brands', async (request, reply) => {
    try {
      const { lat, lng, radius } = request.query as {
        lat?: string
        lng?: string
        radius?: string
      }

      const centerLat = lat ? parseFloat(lat) : -6.2
      const centerLng = lng ? parseFloat(lng) : 106.8
      const searchRadius = radius ? parseInt(radius) : 5000

      // Generate famous brands with random positions within radius
      const brandResults = FAMOUS_BRANDS.map(brand => {
        const latOffset = (Math.random() - 0.5) * 0.05
        const lngOffset = (Math.random() - 0.5) * 0.05
        const distance = Math.round(Math.sqrt(latOffset * latOffset + lngOffset * lngOffset) * 111000)
        
        return {
          placeId: `brand_${brand.name.replace(/[^a-zA-Z]/g, '').toLowerCase()}`,
          name: brand.name,
          category: brand.category,
          rating: brand.rating,
          priceLevel: brand.priceLevel,
          address: `Jl. ${brand.name} - Various Locations`,
          lat: centerLat + latOffset,
          lng: centerLng + lngOffset,
          distance,
          isOpen: Math.random() > 0.1,
          photoRef: null,
          isFamousBrand: true
        }
      }).filter(b => b.distance <= searchRadius)

      return reply.send({
        ok: true,
        data: { 
          competitors: brandResults.sort((a, b) => a.distance - b.distance), 
          total: brandResults.length,
          source: 'famous_brands' 
        },
      })

    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ ok: false, error: 'Failed to fetch brands' })
    }
  })

  // GET /competitors/:placeId/details - Get detailed info including opening hours
  app.get('/competitors/:placeId/details', async (request, reply) => {
    try {
      const { placeId } = request.params as { placeId: string }
      const { category } = request.query as { category?: string }

      if (!service) {
        // Mock data with popular times
        const mockPopularTimes = generateMockPopularTimes(category || 'restaurant')
        return reply.send({
          ok: true,
          data: { 
            placeId,
            weekdayText: ['Senin: 08:00 - 22:00', 'Selasa: 08:00 - 22:00', 'Rabu: 08:00 - 22:00', 'Kamis: 08:00 - 22:00', 'Jumat: 08:00 - 23:00', 'Sabtu: 09:00 - 23:00', 'Minggu: 09:00 - 21:00'],
            popularTimes: mockPopularTimes,
            currentBusyLevel: getCurrentBusyLevel(mockPopularTimes),
            source: 'mock'
          },
        })
      }

      const openingHours = await service.getOpeningHours(placeId)
      const popularTimes = service.generatePopularTimes(category || 'restaurant')

      return reply.send({
        ok: true,
        data: {
          placeId,
          openingHours,
          weekdayText: openingHours?.weekdayText ?? null,
          popularTimes,
          currentBusyLevel: getCurrentBusyLevel(popularTimes),
        },
      })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ ok: false, error: 'Failed to fetch details' })
    }
  })
}

// Helper to generate mock popular times
function generateMockPopularTimes(category: string): { [day: string]: number[] } {
  const service = new CompetitorService('mock')
  return service.generatePopularTimes(category)
}

// Helper to get current busy level
function getCurrentBusyLevel(popularTimes: { [day: string]: number[] } | undefined): string {
  if (!popularTimes) return 'unknown'
  
  const now = new Date()
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const currentDay = dayNames[now.getDay()]
  const currentHour = now.getHours()
  
  const dayData = popularTimes[currentDay]
  if (!dayData || !dayData[currentHour]) return 'unknown'
  
  const level = dayData[currentHour]
  if (level >= 80) return 'very_busy'
  if (level >= 60) return 'busy'
  if (level >= 40) return 'moderate'
  if (level >= 20) return 'quiet'
  return 'very_quiet'
}

// ─── Mock data fallback ───────────────────────────────────────────────────────

// Real brand names commonly found in Indonesia - FAMOUS CHAINS
const FAMOUS_BRANDS = [
  // Coffee
  { name: 'Starbucks', category: 'coffee', rating: 4.2, priceLevel: 3 },
  { name: 'Starbucks Reserve', category: 'coffee', rating: 4.5, priceLevel: 3 },
  { name: 'Kopi Kenangan', category: 'coffee', rating: 4.3, priceLevel: 2 },
  { name: 'Kopi Janji Jiwa', category: 'coffee', rating: 4.1, priceLevel: 2 },
  { name: 'Titik Temu', category: 'coffee', rating: 4.4, priceLevel: 3 },
  { name: 'Common Grounds', category: 'coffee', rating: 4.0, priceLevel: 3 },
  { name: 'Anomali Coffee', category: 'coffee', rating: 4.3, priceLevel: 2 },
  { name: 'Goela Klapa', category: 'coffee', rating: 4.2, priceLevel: 2 },
  { name: 'Chatime', category: 'coffee', rating: 4.0, priceLevel: 2 },
  { name: 'Mixue', category: 'coffee', rating: 4.3, priceLevel: 1 },
  // Fast Food
  { name: 'McDonald\'s', category: 'fastfood', rating: 4.1, priceLevel: 2 },
  { name: 'KFC', category: 'fastfood', rating: 4.0, priceLevel: 2 },
  { name: 'Burger King', category: 'fastfood', rating: 4.2, priceLevel: 3 },
  { name: 'Pizza Hut', category: 'fastfood', rating: 3.9, priceLevel: 3 },
  { name: 'Domino\'s Pizza', category: 'fastfood', rating: 4.1, priceLevel: 3 },
  { name: 'Texas Chicken', category: 'fastfood', rating: 4.0, priceLevel: 2 },
  { name: 'Wendy\'s', category: 'fastfood', rating: 4.2, priceLevel: 3 },
  { name: 'Subway', category: 'fastfood', rating: 3.8, priceLevel: 2 },
  { name: 'Popeyes', category: 'fastfood', rating: 4.1, priceLevel: 2 },
  { name: 'HokBen', category: 'fastfood', rating: 4.0, priceLevel: 2 },
  { name: ' Yoshinoya', category: 'fastfood', rating: 3.9, priceLevel: 2 },
  // Indonesian
  { name: 'Bakmi GM', category: 'indonesian', rating: 4.3, priceLevel: 2 },
  { name: 'Nasi Goreng Mbok Rogue', category: 'indonesian', rating: 4.2, priceLevel: 2 },
  { name: 'Soto Ayu Ambengan', category: 'indonesian', rating: 4.4, priceLevel: 2 },
  { name: 'Ayam Goreng Suharti', category: 'indonesian', rating: 4.5, priceLevel: 2 },
  // Japanese
  { name: 'Sushi Tei', category: 'japanese', rating: 4.5, priceLevel: 3 },
  { name: 'Hokben', category: 'japanese', rating: 4.0, priceLevel: 2 },
  // Western
  { name: 'The Grange', category: 'western', rating: 4.4, priceLevel: 4 },
  { name: 'Parkit Steak', category: 'western', rating: 4.3, priceLevel: 3 },
]

// Real brand names commonly found in Indonesia
const BRAND_DATA: Record<string, { names: string[]; ratings: number[]; priceLevels: number[] }> = {
  coffee: {
    names: [
      'Starbucks', 'Starbucks Reserve', 'Kopi Kenangan', 'Kopi Janji Jiwa',
      'Titik Temu', 'Common Grounds', 'Anomali Coffee', 'Goela Klapa',
      'Seduh Kopi', 'Ombe Kofie', 'Frienz Coffee', 'Kopi Oey',
      'Kopi Toko Djawa', 'Lewis & Carroll', 'Panama Coffee', 'Celsius Coffee',
      'Chatime', 'Mixue', 'Kopi Lanka', 'Djournal Coffee'
    ],
    ratings: [4.2, 4.5, 4.3, 4.1, 4.4, 4.0, 4.3, 4.2, 4.1, 4.0, 3.9, 4.2, 3.8, 4.1, 4.0, 3.9, 4.3, 4.0, 4.1, 4.2],
    priceLevels: [3, 3, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2, 1, 3, 2, 2, 2, 1, 2, 2]
  },
  fastfood: {
    names: [
      'McDonald\'s', 'KFC', 'Burger King', 'Pizza Hut', 'Domino\'s Pizza',
      'Texas Chicken', 'Wendy\'s', 'Subway', 'Popeyes', 'HokBen',
      'Yoshinoya', 'Sushi Hiro', 'Chatime', 'Mixue', 'Carl\'s Jr',
      'Bojonegoro Fried Chicken', 'Mantappu Fried Chicken'
    ],
    ratings: [4.1, 4.0, 4.2, 3.9, 4.1, 4.0, 4.2, 3.8, 4.1, 4.0, 3.9, 4.1, 3.7, 4.3, 4.2, 4.1, 4.0],
    priceLevels: [2, 2, 3, 3, 3, 2, 3, 2, 2, 2, 2, 3, 2, 1, 3, 2, 2]
  },
  indonesian: {
    names: [
      'Warung Kopi Limarasa', 'RM Sederhana', 'Warung Makan Bu Broto',
      'Soto Ayu Ambengan', 'Rawon Setan', 'Nasi Goreng Mbok Rogue',
      'Bakmi GM', 'Mie Aceh', 'Ayam Goreng Suharti', 'Pecel Lele',
      'Warung Kopi', 'Bakso Solo', 'Sate Khas Senayan', 'Gudeg Yu Djum'
    ],
    ratings: [4.3, 4.0, 3.9, 4.4, 4.2, 4.1, 4.3, 4.1, 4.5, 4.0, 3.8, 4.2, 4.1, 4.3],
    priceLevels: [1, 1, 1, 2, 2, 2, 2, 1, 2, 1, 1, 1, 2, 2]
  },
  western: {
    names: [
      'The Chicken King', 'Burger Local', 'Miller\'s', 'Parkit Steak',
      'Woolloomooloo', 'Stout', 'Staco', 'Streets',
      'St. Patrick\'s', 'Starry Night', 'Holy Crab', 'Stacks'
    ],
    ratings: [4.1, 4.2, 4.0, 4.3, 4.4, 4.1, 4.0, 3.9, 4.2, 4.1, 4.3, 4.0],
    priceLevels: [2, 2, 3, 3, 4, 3, 3, 2, 3, 3, 3, 2]
  },
  japanese: {
    names: [
      'Sushi Tei', 'Sakura', 'Ramen Yama', 'Ichiban Sushi', 'Katsuya',
      'Hokkaido', 'Ramen Kenkaku', 'Sushi Massao', 'Don Don',
      'Matsuri', 'Torikago', 'Yoshinoya', 'Sushi Dong'
    ],
    ratings: [4.5, 4.3, 4.2, 4.4, 4.1, 4.3, 4.0, 4.2, 4.1, 4.0, 4.2, 3.9, 4.1],
    priceLevels: [3, 3, 3, 3, 3, 3, 2, 3, 2, 2, 3, 2, 3]
  },
  korean: {
    names: [
      'Kkokkal', 'Seolleongtang', 'Shin Seoul', 'N韩国',
      'Myeongdong', 'Seoul Kitchen', 'Koreatown', 'Jjigae',
      'Bulgogi House', 'Kimchi Mama', 'Bibimbap', 'Korean Grill'
    ],
    ratings: [4.2, 4.3, 4.1, 4.0, 4.4, 4.2, 4.0, 4.1, 4.3, 4.0, 4.2, 3.9],
    priceLevels: [3, 3, 2, 2, 3, 3, 2, 2, 3, 2, 2, 3]
  },
  chinese: {
    names: [
      'Imperial', 'Dim Sum', 'Peking House', 'Golden Dragon',
      'Wong Sol', 'New Hong', 'Prawn Station', 'Bakmi ABC',
      'Mie Goreng', 'Nasi Campur', 'Lo Mie', 'Cap Cay'
    ],
    ratings: [4.2, 4.1, 4.0, 4.3, 3.9, 4.0, 4.1, 3.8, 4.0, 3.9, 4.1, 4.0],
    priceLevels: [3, 2, 3, 3, 2, 2, 2, 1, 2, 1, 2, 2]
  },
  bakery: {
    names: [
      'Bread Talk', 'Roti Canai', 'Lezzato', 'Bakerzin',
      'Roti O', 'Holland Bakery', 'Bread House', 'Tokyo Lunch',
      'Roti Canai Master', 'Donut Republic', 'Krispy Kreme', 'Dunkin\''
    ],
    ratings: [4.0, 4.1, 4.3, 4.2, 3.9, 4.1, 4.0, 3.8, 4.0, 4.2, 4.1, 3.9],
    priceLevels: [2, 1, 2, 3, 1, 2, 2, 2, 1, 2, 2, 2]
  },
  seafood: {
    names: [
      'Pantai Dalam', 'Segar Laut', 'Kepiting Saus Padang',
      'Kerang Rebus', 'Ikan Bakar', 'Ocean Fresh', 'Janji Laut',
      'Nelayan', 'Bandeng Presto', 'Udang Besar', 'Sea Food'
    ],
    ratings: [4.2, 4.1, 4.4, 4.0, 4.3, 4.1, 4.0, 3.9, 4.2, 4.1, 4.0],
    priceLevels: [3, 2, 3, 2, 3, 2, 2, 2, 2, 3, 2]
  },
  ramen: {
    names: [
      'Ramen Yama', 'Ramen Kenkaku', 'Ramen Ichiban', 'Ramen Miso',
      'Ramen Nongshim', 'Ichiriku', 'Ramen House', 'Matsuri Ramen',
      'Ramen Bar', 'Hakata', 'Ramen Jpon', 'Sapporo'
    ],
    ratings: [4.2, 4.3, 4.1, 4.0, 4.2, 4.1, 4.0, 4.3, 3.9, 4.2, 4.0, 4.1],
    priceLevels: [3, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3]
  }
}

function getMockCompetitors(lat: number, lng: number, category?: string) {
  const allCategories = ['coffee', 'fastfood', 'indonesian', 'western', 'japanese', 'korean', 'chinese', 'bakery', 'seafood', 'ramen']
  
  // Filter to selected category or use all
  const categories = category ? [category, ...allCategories.filter(c => c !== category)] : allCategories
  const competitors: any[] = []
  
  // Generate competitors based on selected category
  const totalToGenerate = category ? 8 : 20
  for (let i = 0; i < totalToGenerate; i++) {
    const cat = categories[i % categories.length]
    const brandData = BRAND_DATA[cat]
    
    if (brandData) {
      const nameIndex = i % brandData.names.length
      const ratingIndex = i % brandData.ratings.length
      const priceIndex = i % brandData.priceLevels.length
      
      // Random offset from center
      const latOffset = (Math.random() - 0.5) * 0.01
      const lngOffset = (Math.random() - 0.5) * 0.01
      
      competitors.push({
        placeId: `mock_${i + 1}`,
        name: brandData.names[nameIndex],
        category: cat,
        rating: brandData.ratings[ratingIndex],
        priceLevel: brandData.priceLevels[priceIndex],
        address: `Jl. Contoh No. ${i + 1}, Jakarta`,
        lat: lat + latOffset,
        lng: lng + lngOffset,
        distance: Math.round(Math.sqrt(latOffset * latOffset + lngOffset * lngOffset) * 111000),
        isOpen: Math.random() > 0.2,
        photoRef: null,
      })
    }
  }
  
  // Sort by distance
  return competitors.sort((a, b) => a.distance - b.distance)
}
