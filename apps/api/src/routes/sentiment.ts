import type { FastifyInstance } from 'fastify'

// Simple sentiment analysis (keyword-based)
// For production, use AI API like OpenAI
function analyzeSentiment(text: string): { sentiment: 'positive' | 'negative' | 'neutral', score: number, keywords: string[] } {
  const positiveWords = [
    'bagus', 'baik', 'enak', 'lezat', 'lezat', 'mantap', 'suka', 'cinta', 'keren', 'hebat', 'recommended',
    'good', 'great', 'excellent', 'amazing', 'delicious', 'tasty', 'fresh', 'friendly', 'clean', 'best',
    'recommended', 'worth', 'perfect', 'awesome', 'fantastic', 'love', 'like', 'yummy', 'super'
  ]
  
  const negativeWords = [
    'buruk', 'jelek', 'bukan', 'tidak', 'gagal', 'kecewa', 'salah', 'rusak', 'hilang', 'mati',
    'bad', 'poor', 'terrible', 'awful', 'disgusting', 'dirty', 'slow', 'rude', 'cold', 'expensive',
    'overpriced', 'wait', 'long', 'never', 'disappointed', 'worst', 'hate', 'avoid', 'waste'
  ]

  const lowerText = text.toLowerCase()
  
  let positiveCount = 0
  let negativeCount = 0
  const foundKeywords: string[] = []

  // Check for positive words
  for (const word of positiveWords) {
    if (lowerText.includes(word)) {
      positiveCount++
      foundKeywords.push(word)
    }
  }

  // Check for negative words
  for (const word of negativeWords) {
    if (lowerText.includes(word)) {
      negativeCount++
      foundKeywords.push(word)
    }
  }

  // Calculate score (-1 to 1)
  const total = positiveCount + negativeCount
  let score = 0
  if (total > 0) {
    score = (positiveCount - negativeCount) / total
  }

  // Determine sentiment
  let sentiment: 'positive' | 'negative' | 'neutral'
  if (score > 0.2) {
    sentiment = 'positive'
  } else if (score < -0.2) {
    sentiment = 'negative'
  } else {
    sentiment = 'neutral'
  }

  return {
    sentiment,
    score: Math.round(score * 100) / 100,
    keywords: [...new Set(foundKeywords)].slice(0, 5)
  }
}

export async function sentimentRoutes(app: FastifyInstance) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  // Import CompetitorService
  const { CompetitorService } = await import('../services/CompetitorService')
  const service = apiKey ? new CompetitorService(apiKey) : null

  // GET /sentiment/competitors/:placeId/reviews - Get reviews with sentiment analysis
  app.get('/sentiment/competitors/:placeId/reviews', async (request, reply) => {
    try {
      const { placeId } = request.params as { placeId: string }
      const { limit } = request.query as { limit?: string }
      const maxResults = limit ? parseInt(limit) : 10

      if (!service) {
        // Return mock data if no API key
        const mockReviews = getMockReviews()
        const analyzedReviews = mockReviews.slice(0, maxResults).map(review => ({
          ...review,
          sentiment: analyzeSentiment(review.text)
        }))
        
        return reply.send({
          ok: true,
          data: {
            reviews: analyzedReviews,
            summary: generateSummary(analyzedReviews),
            source: 'mock'
          }
        })
      }

      // Fetch real reviews from Google Places
      const reviews = await service.getReviews(placeId, maxResults)

      // Analyze sentiment for each review
      const analyzedReviews = reviews.map(review => ({
        ...review,
        sentiment: analyzeSentiment(review.text)
      }))

      return reply.send({
        ok: true,
        data: {
          reviews: analyzedReviews,
          summary: generateSummary(analyzedReviews),
          source: 'google_places'
        }
      })

    } catch (err: any) {
      app.log.error(err)
      return reply.code(500).send({ ok: false, error: err.message })
    }
  })

  // GET /sentiment/quick/:placeId - Quick sentiment check (for list view)
  app.get('/sentiment/quick/:placeId', async (request, reply) => {
    try {
      const { placeId } = request.params as { placeId: string }

      if (!service) {
        // Mock quick sentiment
        return reply.send({
          ok: true,
          data: {
            rating: 4.2,
            sentiment: 'positive',
            totalReviews: 127,
            source: 'mock'
          }
        })
      }

      // Get reviews and analyze
      const reviews = await service.getReviews(placeId, 20)
      
      if (reviews.length === 0) {
        return reply.send({
          ok: true,
          data: {
            rating: 0,
            sentiment: 'neutral',
            totalReviews: 0,
            source: 'google_places'
          }
        })
      }

      // Calculate average rating
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

      // Overall sentiment
      const allSentiments = reviews.map(r => analyzeSentiment(r.text))
      const positiveCount = allSentiments.filter(s => s.sentiment === 'positive').length
      const negativeCount = allSentiments.filter(s => s.sentiment === 'negative').length

      let overallSentiment: 'positive' | 'negative' | 'neutral'
      if (positiveCount > negativeCount) {
        overallSentiment = 'positive'
      } else if (negativeCount > positiveCount) {
        overallSentiment = 'negative'
      } else {
        overallSentiment = 'neutral'
      }

      return reply.send({
        ok: true,
        data: {
          rating: Math.round(avgRating * 10) / 10,
          sentiment: overallSentiment,
          totalReviews: reviews.length,
          source: 'google_places'
        }
      })

    } catch (err: any) {
      app.log.error(err)
      return reply.code(500).send({ ok: false, error: err.message })
    }
  })
}

// Generate summary from analyzed reviews
function generateSummary(reviews: any[]) {
  const total = reviews.length
  if (total === 0) {
    return { positive: 0, negative: 0, neutral: 0, overall: 'neutral', topKeywords: [] }
  }

  const positive = reviews.filter(r => r.sentiment.sentiment === 'positive').length
  const negative = reviews.filter(r => r.sentiment.sentiment === 'negative').length
  const neutral = total - positive - negative

  let overall: 'positive' | 'negative' | 'neutral'
  if (positive > negative) {
    overall = 'positive'
  } else if (negative > positive) {
    overall = 'negative'
  } else {
    overall = 'neutral'
  }

  // Collect all keywords
  const allKeywords = reviews.flatMap(r => r.sentiment.keywords || [])
  const keywordCounts: Record<string, number> = {}
  allKeywords.forEach(k => {
    keywordCounts[k] = (keywordCounts[k] || 0) + 1
  })
  
  const topKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }))

  return {
    positive: Math.round((positive / total) * 100),
    negative: Math.round((negative / total) * 100),
    neutral: Math.round((neutral / total) * 100),
    overall,
    topKeywords
  }
}

// Mock reviews for testing
function getMockReviews() {
  return [
    {
      authorName: 'Ahmad Rizki',
      rating: 5,
      text: 'Tempatnya sangat nyaman dan bersih. Kopi nya enak banget! Sangat recommended untuk belajar atau kerja.',
      relativeTimeDescription: '2 weeks ago',
      publishAt: '2024-01-15'
    },
    {
      authorName: 'Siti Nurhaliza',
      rating: 4,
      text: 'Kopi nya ok, tapi tempatnya agak sempit. Suasana bagus buat foto.',
      relativeTimeDescription: '1 month ago',
      publishAt: '2024-01-01'
    },
    {
      authorName: 'Budi Santoso',
      rating: 3,
      text: 'Lumayan lah buat nongkrong. Tapi kadang antri lama ya.',
      relativeTimeDescription: '3 weeks ago',
      publishAt: '2024-01-10'
    },
    {
      authorName: 'Dewi Kartika',
      rating: 5,
      text: 'Best coffee place in town! Staff friendly, ambiance perfect, prices reasonable. Will definitely come back!',
      relativeTimeDescription: '1 week ago',
      publishAt: '2024-01-20'
    },
    {
      authorName: 'Joko Prasetyo',
      rating: 2,
      text: 'Kecewa sama服务质量. Kopi datang lama, dingin lagi. Tidak rekomendasi.',
      relativeTimeDescription: '5 days ago',
      publishAt: '2024-01-22'
    },
  ]
}
