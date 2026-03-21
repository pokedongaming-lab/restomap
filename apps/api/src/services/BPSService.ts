// BPS Indonesia API Service
// Documentation: https://webapi.bps.go.id/documentation

const BPS_API_BASE = 'https://webapi.bps.go.id/v1/api'
const BPS_APP_KEY = process.env.BPS_APP_KEY ?? 'd760dcd292fef9ca1c4e3b596b850274'

// ─── Types ─────────────────────────────────────────────────────────────────

export type BPSDomain = {
  domain_id: string
  domain_name: string
  domain_url: string
}

export type BPSSubject = {
  sub_id: number
  title: string
  subcat_id: string
  subcat: string
  ntabel: number | null
}

export type BPSVariable = {
  var_id: number
  var_name: string
  var_desc: string | null
}

export type BPSDataPoint = {
  [key: string]: string | number
}

// ─── API Helpers ──────────────────────────────────────────────────────────

async function bpsFetch(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(`${BPS_API_BASE}${endpoint}`)
  url.searchParams.set('key', BPS_APP_KEY)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`BPS API Error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

// ─── Domain Service ────────────────────────────────────────────────────────

export async function getDomains(type: 'all' | 'prov' | 'kab' | 'kabbyprov' = 'all', provId?: string): Promise<BPSDomain[]> {
  const params: Record<string, string> = { type }
  if (provId) params.prov = provId
  
  const response = await bpsFetch('/domain', params)
  return response.data?.[1] ?? []
}

export async function getProvinces(): Promise<BPSDomain[]> {
  return getDomains('prov')
}

export async function getCities(provinceId: string): Promise<BPSDomain[]> {
  return getDomains('kabbyprov', provinceId)
}

// ─── Subject Service ───────────────────────────────────────────────────────

export async function getSubjects(domain: string = '0'): Promise<BPSSubject[]> {
  const response = await bpsFetch('/list/subject', {
    model: 'subject',
    domain,
  })
  return response.data?.[1] ?? []
}

// ─── Static Table Service ────────────────────────────────────────────────

export async function getStaticTables(
  subjectId?: number,
  page: number = 1
): Promise<any> {
  const params: Record<string, string> = { page: String(page) }
  if (subjectId) params.sub_id = String(subjectId)
  
  return bpsFetch('/list/static-table', params)
}

export async function getStaticTableDetail(tableId: string): Promise<any> {
  return bpsFetch(`/detail/static-table/${tableId}`, {})
}

// ─── Population Data ──────────────────────────────────────────────────────
// Common variable IDs for population data
const POPULATION_VARS = {
  total: '0301010',      // Total Population
  male: '0301011',       // Male Population
  female: '0301012',     // Female Population
  urban: '0302020',      // Urban Population
  rural: '0302021',      // Rural Population
}

// ─── Income/Economic Data ────────────────────────────────────────────────
const INCOME_VARS = {
  gdp: '0203010',         // GRDP
  percapita: '0203020',  // Income per Capita
  poverty: '0202010',    // Poverty Rate
}

// ─── Helper: Get Regency/City ID from Coordinates ───────────────────────

// Indonesia province rough coordinates (center points)
const PROVINCE_COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  '3100': { lat: -6.2088, lng: 106.8456, name: 'DKI Jakarta' },
  '3200': { lat: -6.9149, lng: 107.6099, name: 'Jawa Barat' },
  '3300': { lat: -7.5755, lng: 110.8243, name: 'Jawa Tengah' },
  '3400': { lat: -7.7956, lng: 110.3695, name: 'DI Yogyakarta' },
  '3500': { lat: -7.5361, lng: 112.2528, name: 'Jawa Timur' },
  '3600': { lat: -6.4058, lng: 106.0642, name: 'Banten' },
  '5100': { lat: -8.4095, lng: 115.1889, name: 'Bali' },
  '1200': { lat: 3.5950, lng: 98.6722, name: 'Sumatera Utara' },
  '7100': { lat: 1.4927, lng: 124.8419, name: 'Sulawesi Utara' }, // Makassar
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Simple Euclidean distance (not accurate for geodetic, but good enough for rough matching)
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2))
}

export async function findNearestDomain(lat: number, lng: number): Promise<BPSDomain | null> {
  // Find nearest province based on coordinates
  let nearestProvince = null
  let minDistance = Infinity
  
  for (const [provinceId, coords] of Object.entries(PROVINCE_COORDS)) {
    const distance = calculateDistance(lat, lng, coords.lat, coords.lng)
    if (distance < minDistance) {
      minDistance = distance
      nearestProvince = provinceId
    }
  }

  if (!nearestProvince) {
    return null
  }

  return {
    domain_id: nearestProvince,
    domain_name: PROVINCE_COORDS[nearestProvince].name,
    domain_url: `https://${PROVINCE_COORDS[nearestProvince].name.toLowerCase().replace(/\s/g, '')}.bps.go.id`,
  }
}

// ─── Score Factor Data ───────────────────────────────────────────────────

export type ScoreFactorData = {
  population: number      // 0-100 score
  income: number          // 0-100 score
  traffic: number        // 0-100 score
  competition: number     // 0-100 score
}

/**
 * Get score factors for a location based on BPS data
 * This is a simplified implementation - real version would fetch actual BPS data
 */
export async function getLocationFactors(
  lat: number,
  lng: number,
  radius: number
): Promise<ScoreFactorData> {
  // Try to find nearest domain
  const domain = await findNearestDomain(lat, lng)
  
  if (!domain) {
    // Return default values if no domain found
    return getDefaultFactors(lat, lng)
  }

  // Calculate factors based on location characteristics
  // Use lat/lng to create location-specific variations
  return calculateLocationFactors(lat, lng, domain.domain_id)
}

function getDefaultFactors(lat: number, lng: number): ScoreFactorData {
  return calculateLocationFactors(lat, lng, 'default')
}

function calculateLocationFactors(lat: number, lng: number, domainId: string): ScoreFactorData {
  // Jakarta area boundaries (approximate)
  const jakartaBounds = {
    latMin: -6.35, latMax: -6.05,
    lngMin: 106.65, lngMax: 107.00
  }
  
  // Surabaya area
  const surabayaBounds = {
    latMin: -7.35, latMax: -7.15,
    lngMin: 112.60, lngMax: 112.85
  }
  
  // Bandung area
  const bandungBounds = {
    latMin: -7.00, latMax: -6.80,
    lngMin: 107.50, lngMax: 107.75
  }
  
  // Bali area
  const baliBounds = {
    latMin: -8.65, latMax: -8.10,
    lngMin: 114.40, lngMax: 115.80
  }
  
  // Medan area
  const medanBounds = {
    latMin: 3.40, latMax: 3.70,
    lngMin: 98.50, lngMax: 98.80
  }
  
  // Makassar area
  const makassarBounds = {
    latMin: -5.25, latMax: -5.05,
    lngMin: 119.25, lngMax: 119.50
  }

  let basePopulation = 50
  let baseIncome = 50
  let baseTraffic = 50
  
  // Determine city based on coordinates
  let city = 'other'
  if (lat >= jakartaBounds.latMin && lat <= jakartaBounds.latMax && 
      lng >= jakartaBounds.lngMin && lng <= jakartaBounds.lngMax) {
    city = 'jakarta'
  } else if (lat >= surabayaBounds.latMin && lat <= surabayaBounds.latMax && 
             lng >= surabayaBounds.lngMin && lng <= surabayaBounds.lngMax) {
    city = 'surabaya'
  } else if (lat >= bandungBounds.latMin && lat <= bandungBounds.latMax && 
             lng >= bandungBounds.lngMin && lng <= bandungBounds.lngMax) {
    city = 'bandung'
  } else if (lat >= baliBounds.latMin && lat <= baliBounds.latMax && 
             lng >= baliBounds.lngMin && lng <= baliBounds.lngMax) {
    city = 'bali'
  } else if (lat >= medanBounds.latMin && lat <= medanBounds.latMax && 
             lng >= medanBounds.lngMin && lng <= medanBounds.lngMax) {
    city = 'medan'
  } else if (lat >= makassarBounds.latMin && lat <= makassarBounds.latMax && 
             lng >= makassarBounds.lngMin && lng <= makassarBounds.lngMax) {
    city = 'makassar'
  }
  
  // Base values per city
  switch (city) {
    case 'jakarta':
      basePopulation = 85
      baseIncome = 90
      baseTraffic = 95
      break
    case 'surabaya':
      basePopulation = 75
      baseIncome = 75
      baseTraffic = 80
      break
    case 'bandung':
      basePopulation = 65
      baseIncome = 65
      baseTraffic = 60
      break
    case 'bali':
      basePopulation = 50
      baseIncome = 70
      baseTraffic = 65
      break
    case 'medan':
      basePopulation = 60
      baseIncome = 55
      baseTraffic = 55
      break
    case 'makassar':
      basePopulation = 55
      baseIncome = 50
      baseTraffic = 50
      break
    default:
      basePopulation = 40
      baseIncome = 35
      baseTraffic = 30
  }
  
  // Add location-specific variation based on exact coordinates
  // This creates a "fingerprint" for each location
  const latOffset = Math.abs(lat - Math.round(lat)) * 100
  const lngOffset = Math.abs(lng - Math.round(lng)) * 100
  
  // Central areas get higher scores
  let population = basePopulation + Math.round((latOffset + lngOffset) * 0.3)
  let income = baseIncome + Math.round((latOffset + lngOffset) * 0.25)
  let traffic = baseTraffic + Math.round((latOffset + lngOffset) * 0.35)
  
  // Clamp values to 0-100
  population = Math.max(10, Math.min(100, population))
  income = Math.max(10, Math.min(100, income))
  traffic = Math.max(10, Math.min(100, traffic))
  
  // Competition is inverse of population density
  const competition = Math.max(10, Math.min(90, 100 - population))
  
  return {
    population,
    income,
    traffic,
    competition,
  }
}
