import { Client, PlacesNearbyRanking } from '@googlemaps/google-maps-services-js'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Competitor = {
  placeId:    string
  name:       string
  category:   string
  rating:     number | null
  priceLevel: number | null
  address:    string
  lat:        number
  lng:        number
  distance:   number
  isOpen:     boolean | null
  photoRef:   string | null
  // Opening hours data
  openingHours?: {
    periods: Array<{
      open: { day: number; time: string }
      close: { day: number; time: string }
    }>
    weekdayText: string[]
  }
  // Popular times / current busy level
  currentOpeningTime?: string
  currentClosingTime?: string
  popularTimes?: {
    // Day of week (0=Sunday) -> hourly busyness (0-100)
    [day: string]: number[]
  }
}

export type CompetitorQuery = {
  lat:      number
  lng:      number
  radius:   number
  category: string | null
  maxResults?: number
}

// ─── Category → Places type mapping ──────────────────────────────────────────

const CATEGORY_TYPES: Record<string, string> = {
  coffee:     'cafe',
  ramen:      'restaurant',
  seafood:    'restaurant',
  fastfood:   'meal_takeaway',
  indonesian: 'restaurant',
  western:    'restaurant',
  chinese:    'restaurant',
  japanese:   'restaurant',
  korean:     'restaurant',
  bakery:     'bakery',
}

// ─── Distance helper ──────────────────────────────────────────────────────────

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000 // meters
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class CompetitorService {
  private client: Client

  constructor(private apiKey: string) {
    this.client = new Client({})
  }

  async findNearby(query: CompetitorQuery): Promise<Competitor[]> {
    const type = query.category ? (CATEGORY_TYPES[query.category] ?? 'restaurant') : 'restaurant'
    const keyword = query.category ?? undefined

    const response = await this.client.placesNearby({
      params: {
        location: { lat: query.lat, lng: query.lng },
        radius: query.radius,
        type,
        keyword,
        key: this.apiKey,
      },
    })

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API error: ${response.data.status}`)
    }

    const results = response.data.results ?? []
    const limit   = query.maxResults ?? 20

    return results.slice(0, limit).map((place) => {
      const lat = place.geometry?.location.lat ?? 0
      const lng = place.geometry?.location.lng ?? 0

      return {
        placeId:    place.place_id ?? '',
        name:       place.name ?? 'Unknown',
        category:   query.category ?? this.inferCategory(place.types ?? []),
        rating:     place.rating ?? null,
        priceLevel: place.price_level ?? null,
        address:    place.vicinity ?? '',
        lat,
        lng,
        distance:   Math.round(haversine(query.lat, query.lng, lat, lng)),
        isOpen:     place.opening_hours?.open_now ?? null,
        photoRef:   place.photos?.[0]?.photo_reference ?? null,
      }
    }).sort((a, b) => a.distance - b.distance)
  }

  private inferCategory(types: string[]): string {
    if (types.includes('cafe'))          return 'coffee'
    if (types.includes('bakery'))        return 'bakery'
    if (types.includes('meal_takeaway')) return 'fastfood'
    return 'restaurant'
  }

  // Get detailed opening hours for a specific place (for peak hours)
  async getOpeningHours(placeId: string): Promise<Competitor['openingHours'] | null> {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: ['opening_hours'],
          key: this.apiKey,
        },
      })

      if (response.data.status !== 'OK' || !response.data.result?.opening_hours) {
        return null
      }

      return {
        periods: response.data.result.opening_hours.periods ?? [],
        weekdayText: response.data.result.opening_hours.weekday_text ?? [],
      }
    } catch (error) {
      console.error('Error fetching opening hours:', error)
      return null
    }
  }

  // Get current opening/closing time for a place
  getCurrentHours(openingHours: Competitor['openingHours']): { open: string; close: string } | null {
    if (!openingHours?.periods || openingHours.periods.length === 0) {
      return null
    }

    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday
    const timeString = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`

    // Find today's periods
    const todayPeriods = openingHours.periods.filter(
      p => p.open?.day === dayOfWeek
    )

    if (todayPeriods.length === 0) {
      return null
    }

    // If open now, find current period
    for (const period of todayPeriods) {
      const openTime = period.open?.time ?? '0000'
      const closeTime = period.close?.time ?? '2359'

      if (timeString >= openTime && timeString <= closeTime) {
        return {
          open: `${openTime.slice(0, 2)}:${openTime.slice(2)}`,
          close: `${closeTime.slice(0, 2)}:${closeTime.slice(2)}`,
        }
      }
    }

    // Not currently open
    return null
  }

  // Generate popular times data based on category (simulates Google Popular Times)
  // Real implementation would fetch from Google Places API
  generatePopularTimes(category: string): Competitor['popularTimes'] {
    // Typical busy patterns for F&B
    const patterns: Record<string, number[]> = {
      // Coffee: busy morning and afternoon
      coffee: [
        [10, 15, 20, 25, 30, 40, 55, 70, 85, 95, 90, 80, // 6AM-5PM
         75, 80, 85, 90, 85, 70, 50, 35, 20, 10, 5, 5]   // 6PM-5AM
      ],
      // Restaurant: busy lunch and dinner
      restaurant: [
        [5, 5, 5, 10, 20, 35, 50, 65, 75, 70, 60, 50, // 6AM-5PM
         45, 50, 60, 75, 90, 95, 90, 80, 60, 40, 20, 10] // 6PM-5AM
      ],
      // Fast food: consistent throughout day
      fastfood: [
        [20, 25, 30, 40, 50, 60, 65, 70, 75, 70, 65, 60,
         55, 60, 65, 70, 75, 80, 75, 65, 55, 45, 35, 25]
      ],
      // Default pattern
      default: [
        [5, 5, 5, 10, 20, 35, 50, 65, 75, 70, 60, 50,
         45, 50, 60, 70, 80, 85, 80, 70, 55, 35, 20, 10]
      ],
    }

    const pattern = patterns[category] || patterns['default']
    const popularTimes: { [day: string]: number[] } = {}
    
    // Generate for each day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    dayNames.forEach((day, dayIndex) => {
      const dailyPattern = [...pattern]
      
      // Weekend boost
      if (dayIndex === 0 || dayIndex === 6) { // Sunday or Saturday
        dailyPattern.forEach((_, hour) => {
          if (hour >= 11 && hour <= 14) { // Lunch
            dailyPattern[hour] = Math.min(100, dailyPattern[hour] + 15)
          }
          if (hour >= 18 && hour <= 21) { // Dinner
            dailyPattern[hour] = Math.min(100, dailyPattern[hour] + 20)
          }
        })
      }
      
      // Friday evening boost
      if (dayIndex === 5) { // Friday
        dailyPattern.forEach((_, hour) => {
          if (hour >= 19 && hour <= 22) {
            dailyPattern[hour] = Math.min(100, dailyPattern[hour] + 25)
          }
        })
      }
      
      popularTimes[day] = dailyPattern
    })

    return popularTimes
  }
}
