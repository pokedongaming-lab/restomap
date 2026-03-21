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
}
