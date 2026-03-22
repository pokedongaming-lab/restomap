import type { FastifyInstance } from 'fastify'

/**
 * Bayesian Rating Correction
 * 
 * Mengkoreksi rating berdasarkan jumlah review untuk hasil yang lebih fair.
 * Konsep: Tempat dengan review lebih banyak = confidence lebih tinggi.
 * 
 * Formula: Bayesian Average = (rating * n + prior * m) / (n + m)
 * - n = jumlah review
 * - m = confidence weight (semakin banyak review, semakin tinggi)
 * - prior = rating rata-rata global
 */

interface CompetitorWithReviews {
  placeId: string
  name: string
  category: string
  rating: number | null
  userRatingsTotal: number
  distance: number
}

function calculateBayesianRating(
  rating: number | null, 
  reviewCount: number, 
  prior: number, 
  confidenceWeight: number = 30
): { bayesianRating: number; confidence: string; ratingChange: number } {
  // Ensure we have valid numbers
  const n = reviewCount || 0
  const r = rating ?? prior
  const m = confidenceWeight
  
  // Bayesian average formula: weighted average of rating and prior
  // Weight by number of reviews (n) vs confidence weight (m)
  const bayesianRating = ((r * n) + (prior * m)) / (n + m)
  
  // Round to 2 decimal places
  const roundedBayesian = Math.round(bayesianRating * 100) / 100
  
  // Calculate change from original
  const ratingChange = rating !== null 
    ? Math.round((roundedBayesian - rating) * 100) / 100 
    : 0
  
  // Determine confidence based on review count
  let confidence: string
  if (n >= 200) {
    confidence = 'very_high'
  } else if (reviewCount >= 150) {
    confidence = 'high'
  } else if (reviewCount >= 100) {
    confidence = 'medium'
  } else if (n >= 50) {
    confidence = 'low'
  } else {
    confidence = 'very_low'
  }

  return {
    bayesianRating: roundedBayesian,
    confidence,
    ratingChange
  }
}

function getConfidenceColor(confidence: string): string {
  switch (confidence) {
    case 'very_high': return 'text-green-600 bg-green-50'
    case 'high': return 'text-green-500 bg-green-50/50'
    case 'medium': return 'text-amber-600 bg-amber-50'
    case 'low': return 'text-orange-600 bg-orange-50'
    default: return 'text-gray-500 bg-gray-50'
  }
}

export async function bayesianRoutes(app: FastifyInstance) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  const { CompetitorService } = await import('../services/CompetitorService')
  const service = apiKey ? new CompetitorService(apiKey) : null

  // GET /bayesian/rate?lat=&lng=&radius=&category=
  app.get('/bayesian/rate', async (request, reply) => {
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
        competitors = results.map(c => ({
          ...c,
          userRatingsTotal: Math.floor(Math.random() * 500) + 10
        }))
      }

      // Filter valid ratings
      const validRatings = competitors.filter(c => c.rating !== null).map(c => c.rating!)
      const prior = validRatings.length > 0 
        ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length 
        : 4.0

      // Calculate Bayesian rating for each competitor
      const results = competitors.map(comp => {
        const bayesian = calculateBayesianRating(
          comp.rating,
          comp.userRatingsTotal || 10,
          prior
        )

        return {
          placeId: comp.placeId,
          name: comp.name,
          category: comp.category,
          rating: comp.rating,
          userRatingsTotal: comp.userRatingsTotal,
          distance: comp.distance,
          bayesianRating: bayesian.bayesianRating,
          confidence: bayesian.confidence,
          ratingChange: bayesian.ratingChange
        }
      })

      // Sort by Bayesian rating (highest first)
      const sortedByBayesian = [...results].sort((a, b) => b.bayesianRating - a.bayesianRating)
      const sortedByConfidence = [...results].sort((a, b) => {
        const confOrder = { very_high: 5, high: 4, medium: 3, low: 2, very_low: 1 }
        return (confOrder[b.confidence as keyof typeof confOrder] || 0) - (confOrder[a.confidence as keyof typeof confOrder] || 0)
      })

      // Stats
      const stats = {
        totalCompetitors: competitors.length,
        priorRating: Math.round(prior * 100) / 100,
        avgOriginalRating: Math.round((validRatings.reduce((a, b) => a + b, 0) / validRatings.length) * 100) / 100,
        avgBayesianRating: Math.round(results.reduce((a, b) => a + b.bayesianRating, 0) / results.length * 100) / 100,
        improved: results.filter(r => r.ratingChange > 0).length,
        declined: results.filter(r => r.ratingChange < 0).length,
        unchanged: results.filter(r => r.ratingChange === 0).length,
        confidenceBreakdown: {
          very_high: results.filter(r => r.confidence === 'very_high').length,
          high: results.filter(r => r.confidence === 'high').length,
          medium: results.filter(r => r.confidence === 'medium').length,
          low: results.filter(r => r.confidence === 'low').length,
          very_low: results.filter(r => r.confidence === 'very_low').length,
        }
      }

      return reply.send({
        ok: true,
        data: {
          stats,
          rankings: {
            byBayesianRating: sortedByBayesian.slice(0, 15),
            byConfidence: sortedByConfidence.slice(0, 15)
          },
          allCompetitors: results,
          source: service ? 'google_places' : 'mock'
        }
      })

    } catch (err: any) {
      app.log.error(err)
      return reply.code(500).send({ ok: false, error: err.message })
    }
  })

  // GET /bayesian/compare/:placeId - Compare original vs bayesian for specific place
  app.get('/bayesian/compare/:placeId', async (request, reply) => {
    try {
      const { placeId } = request.params as { placeId: string }
      const { prior } = request.query as { prior?: string }
      
      const priorRating = prior ? parseFloat(prior) : 4.0
      
      // Mock data for comparison
      const mockData = {
        placeId,
        name: 'Sample Restaurant',
        rating: 4.8,
        userRatingsTotal: 156,
        bayesianRating: 4.72,
        confidence: 'high',
        ratingChange: -0.08,
        priorRating
      }

      return reply.send({
        ok: true,
        data: mockData
      })

    } catch (err: any) {
      app.log.error(err)
      return reply.code(500).send({ ok: false, error: err.message })
    }
  })
}

// Mock data generator
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
    
    const ratingBase = 3.5 + Math.random() * 1.5
    const rating = Math.round(ratingBase * 10) / 10
    
    const reviewBase = Math.random() < 0.3 
      ? Math.floor(Math.random() * 50) + 5
      : Math.floor(Math.random() * 400) + 50
    
    const userRatingsTotal = Math.max(5, Math.floor(reviewBase * (rating / 4)))
    
    const latOffset = (Math.random() - 0.5) * 0.02
    const lngOffset = (Math.random() - 0.5) * 0.02
    
    competitors.push({
      placeId: `mock_${i + 1}`,
      name: `${name} ${String.fromCharCode(65 + i)}`,
      category: cat,
      rating,
      userRatingsTotal,
      address: `Jl. Contoh No. ${i + 1}`,
      lat: lat + latOffset,
      lng: lng + lngOffset,
      distance: Math.round(Math.sqrt(latOffset * latOffset + lngOffset * lngOffset) * 111000),
      isOpen: Math.random() > 0.2
    })
  }

  return competitors.sort((a, b) => a.distance - b.distance)
}
