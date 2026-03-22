import axios from 'axios'

const SERP_API_KEY = process.env.SERP_API_KEY

export interface SerpResult {
  place_id?: string
  position?: number
  title: string
  address?: string
  rating?: number
  reviews?: number
  price_range?: string
  type?: string
  lat?: number
  lng?: number
  phone?: string
  website?: string
  operating_hours?: string
  image?: string
}

export async function searchPlaces(
  query: string,
  location: string,
  limit: number = 20
): Promise<SerpResult[]> {
  if (!SERP_API_KEY) {
    console.warn('SERP_API_KEY not configured')
    return []
  }

  try {
    // Search for places using Google
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        api_key: SERP_API_KEY,
        q: query,
        location: location,
        hl: 'id',
        gl: 'id',
        num: limit,
        tbm: 'places', // places module
      },
      timeout: 15000,
    })

    const results: SerpResult[] = []
    
    if (response.data?.place_results) {
      const places = Array.isArray(response.data.place_results) 
        ? response.data.place_results 
        : [response.data.place_results]
      
      places.forEach((place: any, idx: number) => {
        results.push({
          place_id: place.place_id,
          position: idx + 1,
          title: place.title || place.name,
          address: place.address,
          rating: place.rating,
          reviews: place.reviews,
          price_range: place.price_range,
          type: place.type,
          lat: place.latitude,
          lng: place.longitude,
          phone: place.phone,
          website: place.website,
          operating_hours: place.operating_hours,
          image: place.thumbnail,
        })
      })
    }

    return results
  } catch (error: any) {
    console.error('SERP API error:', error.message)
    if (error.response?.data?.error) {
      console.error('SERP error details:', error.response.data.error)
    }
    return []
  }
}

// Alternative: Search for specific brand - more specific queries
export async function searchBrand(
  brandName: string,
  city: string,
  country: string = 'Indonesia'
): Promise<SerpResult[]> {
  // Try multiple search variations for better results
  const queries = [
    `${brandName} ${city}`, // "KFC Manila"
    `${brandName} restaurant ${city}`, // "KFC restaurant Manila"
    `${brandName} ${city} Indonesia`, // "KFC Manila Indonesia"
  ]
  
  for (const query of queries) {
    const results = await searchPlaces(query, `${city}, ${country}`, 20)
    if (results.length > 0) {
      // Filter to only include results matching the brand name
      const brandLower = brandName.toLowerCase()
      const filtered = results.filter(r => 
        r.title?.toLowerCase().includes(brandLower) ||
        r.address?.toLowerCase().includes(brandLower)
      )
      if (filtered.length > 0) {
        return filtered
      }
      return results // Return all if filter results in 0
    }
  }
  
  return []
}
