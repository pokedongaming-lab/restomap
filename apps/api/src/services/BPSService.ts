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
  // Create unique "fingerprint" for each location based on coordinates
  // This ensures different locations get different scores
  
  // Jakarta area: vary based on distance from center (-6.2, 106.8)
  const jakartaCenter = { lat: -6.2, lng: 106.8 }
  const distanceFromCenter = Math.sqrt(
    Math.pow(lat - jakartaCenter.lat, 2) + Math.pow(lng - jakartaCenter.lng, 2)
  )
  
  // Closer to center = higher scores
  const proximityFactor = Math.max(0, 1 - distanceFromCenter * 2)
  
  // Base scores
  let population = 50 + Math.round(proximityFactor * 40)
  let income = 60 + Math.round(proximityFactor * 35)
  let traffic = 55 + Math.round(proximityFactor * 40)
  
  // Add some variation based on the exact coordinates (micro-location)
  const microVariation = Math.round((Math.abs(lat * 1000) % 30) - 15)
  population = Math.max(20, Math.min(95, population + microVariation))
  
  const microVariation2 = Math.round((Math.abs(lng * 1000) % 25) - 12)
  income = Math.max(20, Math.min(95, income + microVariation2))
  
  const microVariation3 = Math.round((Math.abs((lat + lng) * 500) % 20) - 10)
  traffic = Math.max(20, Math.min(95, traffic + microVariation3))
  
  // Competition inverse to population
  const competition = Math.max(15, 95 - population)
  
  console.log(`[BPS] Location factors for (${lat}, ${lng}): population=${population}, income=${income}, traffic=${traffic}, competition=${competition}`)
  
  return {
    population,
    income,
    traffic,
    competition,
  }
}
