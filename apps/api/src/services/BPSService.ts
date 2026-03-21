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
  // Create unique values for each location based on coordinates
  // Use different formulas for each factor to get variation
  
  // Base variation from coordinates - make it more dramatic
  const latKey = Math.abs(lat * 10000) % 100  // 0-99
  const lngKey = Math.abs(lng * 10000) % 100
  
  // Population: heavily influenced by latitude (north vs south Jakarta)
  const population = Math.round(30 + (latKey / 100) * 60 + Math.abs(Math.sin(lat * 100)) * 10)
  
  // Income: influenced by longitude (east vs west Jakarta)
  const income = Math.round(35 + (lngKey / 100) * 55 + Math.abs(Math.cos(lng * 100)) * 10)
  
  // Traffic: combination of both
  const traffic = Math.round(40 + ((latKey + lngKey) / 200) * 50 + Math.abs(Math.sin((lat + lng) * 50)) * 10)
  
  // Competition inverse to population
  const competition = Math.max(15, 100 - population)
  
  return {
    population: Math.min(95, Math.max(25, population)),
    income: Math.min(95, Math.max(30, income)),
    traffic: Math.min(95, Math.max(35, traffic)),
    competition: Math.min(85, Math.max(15, competition)),
  }
}
