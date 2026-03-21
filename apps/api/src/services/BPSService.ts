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

async function bpsFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
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
  
  const response = await bpsFetch<any>('/domain', params)
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
  const response = await bpsFetch<any>('/list/subject', {
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
  
  return bpsFetch<any>('/list/static-table', params)
}

export async function getStaticTableDetail(tableId: string): Promise<any> {
  return bpsFetch<any>(`/detail/static-table/${tableId}`, {})
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

export async function findNearestDomain(lat: number, lng: number): Promise<BPSDomain | null> {
  // Indonesia bounding box approximation
  // This is a simple implementation - in production, use proper geo-matching
  
  const provinces = await getProvinces()
  
  // For now, return first province as placeholder
  // Real implementation would use reverse geocoding
  return provinces[0] ?? null
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
    return {
      population: 50,
      income: 50,
      traffic: 50,
      competition: 50,
    }
  }

  // In production, fetch real BPS data here based on domain_id
  // For now, return calculated values based on domain characteristics
  
  const provinceIds = ['3100', '3200', '3300', '3400', '3500'] // Major cities (Jakarta, Bandung, Semarang, Surabaya, Medan)
  const bigCityIds = ['3171', '3273', '3374', '3578', '3271'] // Jakarta Pusat, Bandung, Semarang, Surabaya, Medan
  
  let population = 50
  let income = 50
  let traffic = 50
  
  if (bigCityIds.includes(domain.domain_id)) {
    population = 90
    income = 85
    traffic = 95
  } else if (provinceIds.includes(domain.domain_id.substring(0, 2) + '00')) {
    population = 70
    income = 60
    traffic = 65
  } else {
    population = 40
    income = 35
    traffic = 30
  }

  // Competition is inverse of population density in this context
  const competition = Math.max(10, 100 - population)

  return {
    population,
    income,
    traffic,
    competition,
  }
}
