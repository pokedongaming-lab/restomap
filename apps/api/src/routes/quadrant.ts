import type { FastifyInstance } from 'fastify'

/**
 * Quadrant Analysis: Rating vs User Reviews
 * 
 * Creates 4 quadrants:
 * - Hidden Gems: High Rating, Low Reviews (potential upsellers)
 * - The Populars: High Rating, High Reviews (market leaders)
 * - Underperformers: Low Rating, Low Reviews (avoid)
 * - Public Critics: Low Rating, High Reviews (careful)
 */

interface CompetitorWithReviews {
  placeId: string
  name: string
  category: string
  rating: number | null
  userRatingsTotal: number  // number of reviews from Google
  distance: number
}

function calculateQuadrant(competitor: CompetitorWithReviews, medianRating: number, medianReviews: number) {
  const rating = competitor.rating ?? 0
  const reviews = competitor.userRatingsTotal
  
  if (rating >= medianRating && reviews >= medianReviews) {
    return 'populars'      // High Rating + High Reviews
  } else if (rating >= medianRating && reviews < medianReviews) {
    return 'hidden_gems'   // High Rating + Low Reviews
  } else if (rating < medianRating && reviews >= medianReviews) {
    return 'public_critics' // Low Rating + High Reviews
  } else {
    return 'underperformers' // Low Rating + Low Reviews
  }
}

function getQuadrantInfo(quadrant: string) {
  const info: Record<string, { label: string; emoji: string; desc: string; strategy: string }> = {
    hidden_gems: {
      label: 'Hidden Gems',
      emoji: '💎',
      desc: 'Rating tinggi, review sedikit',
      strategy: 'Great potential! Partner untuk expansion - kualitas sudah terjamin, lagi naik.'
    },
    populars: {
      label: 'The Populars',
      emoji: '⭐',
      desc: 'Rating tinggi, review banyak',
      strategy: 'Market leaders. Sulit partner tapi bisa belajar dari mereka.'
    },
    underperformers: {
      label: 'Underperformers',
      emoji: '📉',
      desc: 'Rating rendah, review sedikit',
      strategy: 'Avoid. Masalah kualitas, jangan ikut.'
    },
    public_critics: {
      label: 'Public Critics',
      emoji: '📝',
      desc: 'Rating rendah, review banyak',
      strategy: 'Careful! Banyak yang critize, ada systemic issues.'
    }
  }
  return info[quadrant]
}

export async function quadrantRoutes(app: FastifyInstance) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  const { CompetitorService } = await import('../services/CompetitorService')
  const service = apiKey ? new CompetitorService(apiKey) : null

  // GET /quadrant/analyze?lat=&lng=&radius=&category=
  app.get('/quadrant/analyze', async (request, reply) => {
    try {
      const { lat, lng, radius, category } = request.query as {
        lat?: string
        lng?: string
        radius?: string
        category?: string
      }

      if (!lat || !lng || !radius) {
        return reply.code(400).send({
          ok: false,
          error: 'MISSING_PARAMS',
          message: 'lat, lng, and radius are required'
        })
      }

      // Fetch competitors
      let competitors: any[]
      
      if (!service) {
        // Mock data with user ratings
        competitors = getMockCompetitorsWithReviews(
          parseFloat(lat),
          parseFloat(lng),
          parseInt(radius),
          category
        )
      } else {
        const results = await service.findNearby({
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          radius: parseInt(radius),
          category: category ?? null,
          maxResults: 50
        })
        // Mock user ratings for now (Google Places API doesn't expose this directly)
        competitors = results.map(c => ({
          ...c,
          userRatingsTotal: Math.floor(Math.random() * 500) + 10
        }))
      }

      // Calculate medians
      const ratings = competitors.filter(c => c.rating !== null).map(c => c.rating!)
      const reviewCounts = competitors.map(c => c.userRatingsTotal)
      
      const medianRating = getMedian(ratings)
      const medianReviews = getMedian(reviewCounts)

      // Categorize each competitor
      const quadrants = {
        hidden_gems: [] as any[],
        populars: [] as any[],
        underperformers: [] as any[],
        public_critics: [] as any[]
      }

      competitors.forEach(comp => {
        const quadrant = calculateQuadrant(
          { ...comp, rating: comp.rating, userRatingsTotal: comp.userRatingsTotal },
          medianRating,
          medianReviews
        )
        quadrants[quadrant].push({
          placeId: comp.placeId,
          name: comp.name,
          category: comp.category,
          rating: comp.rating,
          userRatingsTotal: comp.userRatingsTotal,
          distance: comp.distance,
          quadrant
        })
      })

      // Calculate percentages
      const total = competitors.length
      const result = {
        ok: true,
        data: {
          summary: {
            totalCompetitors: total,
            medianRating: Math.round(medianRating * 10) / 10,
            medianReviews: medianReviews,
            quadrantCounts: {
              hidden_gems: quadrants.hidden_gems.length,
              populars: quadrants.populars.length,
              underperformers: quadrants.underperformers.length,
              public_critics: quadrants.public_critics.length
            },
            quadrantPercentages: {
              hidden_gems: Math.round((quadrants.hidden_gems.length / total) * 100),
              populars: Math.round((quadrants.populars.length / total) * 100),
              underperformers: Math.round((quadrants.underperformers.length / total) * 100),
              public_critics: Math.round((quadrants.public_critics.length / total) * 100)
            }
          },
          quadrants: {
            hidden_gems: {
              ...getQuadrantInfo('hidden_gems'),
              competitors: quadrants.hidden_gems.slice(0, 10)
            },
            populars: {
              ...getQuadrantInfo('populars'),
              competitors: quadrants.populars.slice(0, 10)
            },
            underperformers: {
              ...getQuadrantInfo('underperformers'),
              competitors: quadrants.underperformers.slice(0, 10)
            },
            public_critics: {
              ...getQuadrantInfo('public_critics'),
              competitors: quadrants.public_critics.slice(0, 10)
            }
          },
          allCompetitors: competitors.map(c => ({
            placeId: c.placeId,
            name: c.name,
            category: c.category,
            rating: c.rating,
            userRatingsTotal: c.userRatingsTotal,
            distance: c.distance,
            quadrant: calculateQuadrant(
              { rating: c.rating, userRatingsTotal: c.userRatingsTotal } as any,
              medianRating,
              medianReviews
            )
          })),
          source: service ? 'google_places' : 'mock'
        }
      }

      return reply.send(result)

    } catch (err: any) {
      app.log.error(err)
      return reply.code(500).send({ ok: false, error: err.message })
    }
  })
}

// Helper: Calculate median
function getMedian(arr: number[]): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

// Mock data with realistic user ratings
function getMockCompetitorsWithReviews(lat: number, lng: number, radius: number, category?: string) {
  const allCategories = ['coffee', 'fastfood', 'indonesian', 'western', 'japanese', 'korean', 'chinese', 'bakery', 'seafood', 'ramen']
  const categories = category ? [category] : allCategories
  
  const competitors = []
  const brands: Record<string, string[]> = {
    coffee: ['Starbucks', 'Kopi Kenangan', 'Titik Temu', 'Anomali Coffee', 'Common Grounds'],
    fastfood: ['McDonald\'s', 'KFC', 'Burger King', 'Pizza Hut', ' Wendy\'s'],
    indonesian: ['Sederhana', 'Pecel Lele', 'Warung Soto', 'Bakmi GM', 'Nasi Goreng'],
    western: ['Texas Chicken', 'Papa John\'s', 'Domino\'s', 'Olive Garden', 'Hard Rock'],
    japanese: ['Sushi King', 'Hokben', 'Sushi Hiro', 'Ramen J抑', 'Ichiban'],
    korean: ['KyoChon', 'Bonchon', 'Kyochon', 'Sae Mul', 'Namoo'],
    chinese: ['Imperial', 'Crystal Jade', 'P某人', 'ShangriLa', 'Lotus'],
    bakery: ['Bread Talk', 'San Francisco', 'Holland Bakery', 'Almond'],
    seafood: ['Fisherman\'s', 'Kepiting', 'Sinar Laut', 'Pondok'],
    ramen: ['RamenYa', 'Ichiran', 'Mazarine', 'Ramen N甩', 'Goroh']
  }

  for (let i = 0; i < 25; i++) {
    const cat = categories[i % categories.length]
    const brandList = brands[cat] || brands.indonesian
    const name = brandList[i % brandList.length]
    
    // Generate realistic rating distribution (mostly 3.5-4.5)
    const ratingBase = 3.5 + Math.random() * 1.5
    const rating = Math.round(ratingBase * 10) / 10
    
    // Generate review count - higher chance of more reviews for better rated
    const reviewBase = Math.random() < 0.3 
      ? Math.floor(Math.random() * 50) + 5  // Low reviews
      : Math.floor(Math.random() * 400) + 50 // High reviews
    
    // Bias: better rating = more reviews
    const userRatingsTotal = Math.floor(reviewBase * (rating / 4))
    
    const latOffset = (Math.random() - 0.5) * 0.02
    const lngOffset = (Math.random() - 0.5) * 0.02
    
    competitors.push({
      placeId: `mock_${i + 1}`,
      name: `${name} ${String.fromCharCode(65 + i)}`,
      category: cat,
      rating,
      userRatingsTotal: Math.max(5, userRatingsTotal),
      address: `Jl. Contoh No. ${i + 1}`,
      lat: lat + latOffset,
      lng: lng + lngOffset,
      distance: Math.round(Math.sqrt(latOffset * latOffset + lngOffset * lngOffset) * 111000),
      isOpen: Math.random() > 0.2
    })
  }

  return competitors.sort((a, b) => a.distance - b.distance)
}
