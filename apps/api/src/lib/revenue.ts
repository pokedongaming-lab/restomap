/**
 * Revenue & Financial Calculations
 * Engine untuk kalkulasi revenue, profit, break-even
 */

// Tipe data
export interface RestaurantTypeConfig {
  value: string
  label: string
  breakEvenMonths: number
  avgCheckRange: { min: number; max: number }
  costPerSeat: number
  occupancyRate: number
  turnsPerDay: number
}

export interface ZoneMultiplier {
  [zone: string]: number
}

export interface RevenueInput {
  city: string
  zone: string
  restaurantType: string
  competition: number
  seatingSize?: number
  avgCheckOverride?: number
}

export interface RevenueResult {
  daily: { covers: number; revenue: number }
  monthly: { revenue: number; operatingCost: number; estimatedRent: number; profit: number }
  annual: { revenue: number; profit: number }
  avgCheck: number
  startupCost: number
  breakEvenMonths: number
}

// Konfigurasi restaurant types
export const RESTAURANT_TYPES: RestaurantTypeConfig[] = [
  { value: 'kafe', label: 'Kafe', breakEvenMonths: 8, avgCheckRange: { min: 25000, max: 75000 }, costPerSeat: 15000000, occupancyRate: 0.65, turnsPerDay: 3 },
  { value: 'restoran_keluarga', label: 'Restoran Keluarga', breakEvenMonths: 12, avgCheckRange: { min: 50000, max: 150000 }, costPerSeat: 20000000, occupancyRate: 0.7, turnsPerDay: 2.5 },
  { value: 'fast_food', label: 'Fast Food', breakEvenMonths: 6, avgCheckRange: { min: 20000, max: 50000 }, costPerSeat: 10000000, occupancyRate: 0.8, turnsPerDay: 5 },
  { value: 'fine_dining', label: 'Fine Dining', breakEvenMonths: 18, avgCheckRange: { min: 150000, max: 500000 }, costPerSeat: 35000000, occupancyRate: 0.5, turnsPerDay: 1.5 },
  { value: 'food_truck', label: 'Food Truck', breakEvenMonths: 4, avgCheckRange: { min: 15000, max: 40000 }, costPerSeat: 5000000, occupancyRate: 0.6, turnsPerDay: 4 },
  { value: 'cloud_kitchen', label: 'Cloud Kitchen', breakEvenMonths: 3, avgCheckRange: { min: 20000, max: 45000 }, costPerSeat: 3000000, occupancyRate: 0.9, turnsPerDay: 6 },
]

// Zone multipliers untuk Indonesia
export const ZONE_MULTIPLIERS: ZoneMultiplier = {
  // Jakarta
  'jakarta_pusat': 1.4,
  'jakarta_selatan': 1.3,
  'jakarta_barat': 1.2,
  'jakarta_timur': 1.15,
  'jakarta_utara': 1.1,
  // Surabaya
  'surabaya_pusat': 1.25,
  'surabaya_barat': 1.1,
  'surabaya_timur': 1.05,
  // Bandung
  'bandung_pusat': 1.15,
  'bandung_utar': 1.0,
  // Bali
  'bali_utama': 1.3,
  'bali_utara': 1.0,
  // Kota tier 2
  'medan': 1.0,
  'makassar': 0.95,
  'semarang': 0.9,
  'yogyakarta': 0.95,
  // Default
  'default': 0.8,
}

// City tier multipliers
export const CITY_TIER: { [city: string]: number } = {
  'jakarta': 1.4,
  'surabaya': 1.25,
  'bandung': 1.15,
  'bali': 1.2,
  'medan': 1.0,
  'makassar': 0.95,
  'semarang': 0.9,
  'yogyakarta': 0.95,
  'depok': 1.0,
  'tangerang': 1.0,
  'bekasi': 1.0,
  'default': 0.85,
}

// Estimasi sewa per m² per bulan (IDR)
export const RENT_ESTIMATES: { [zone: string]: number } = {
  'jakarta_pusat': 350000,
  'jakarta_selatan': 280000,
  'jakarta_barat': 250000,
  'jakarta_timur': 200000,
  'jakarta_utara': 220000,
  'surabaya_pusat': 250000,
  'bandung_pusat': 200000,
  'bali_utama': 300000,
  'medan': 150000,
  'makassar': 140000,
  'default': 120000,
}

// Cost percentages
export const COST_STRUCTURE = {
  COGS_PCT: 0.32, // Cost of Goods Sold
  LABOR_PCT: 0.25, // Labor
  OVERHEAD_PCT: 0.15, // Utilities, marketing, etc
  RENT_PCT: 0.12, // Rent (varies)
}

/**
 * Get restaurant type config
 */
export function getRestaurantType(type: string): RestaurantTypeConfig {
  return RESTAURANT_TYPES.find(t => t.value === type) || RESTAURANT_TYPES[0]
}

/**
 * Get zone multiplier
 */
export function getZoneMultiplier(zone: string): number {
  const key = zone.toLowerCase().replace(/\s+/g, '_')
  return ZONE_MULTIPLIERS[key] || ZONE_MULTIPLIERS['default']
}

/**
 * Get city tier
 */
export function getCityTier(city: string): number {
  const key = city.toLowerCase().replace(/\s+/g, '_')
  return CITY_TIER[key] || CITY_TIER['default']
}

/**
 * Kalkulasi avg check
 */
export function calculateAvgCheck(
  restaurantType: string,
  zone: string,
  competition: number
): number {
  const type = getRestaurantType(restaurantType)
  const zoneMult = getZoneMultiplier(zone)
  
  // Base avg check dari type
  const baseAvgCheck = (type.avgCheckRange.min + type.avgCheckRange.max) / 2
  
  // Adjust dengan zone
  let adjusted = baseAvgCheck * zoneMult
  
  // Competition factor (inverse - more competition = slightly lower prices)
  const competitionFactor = Math.max(0.7, 1 - (competition * 0.02))
  adjusted *= competitionFactor
  
  return Math.round(adjusted / 1000) * 1000 // Round to nearest 1000
}

/**
 * Kalkulasi revenue projection
 */
export function calculateRevenue(input: RevenueInput): RevenueResult {
  const { city, zone, restaurantType, competition, seatingSize = 50, avgCheckOverride } = input
  
  const type = getRestaurantType(restaurantType)
  const cityTier = getCityTier(city)
  
  // Avg check
  const avgCheck = avgCheckOverride || calculateAvgCheck(restaurantType, zone, competition)
  
  // Daily covers
  const dailyCovers = Math.round(seatingSize * type.occupancyRate * type.turnsPerDay)
  
  // Daily revenue
  const dailyRevenue = dailyCovers * avgCheck
  
  // Monthly revenue (26 hari operasional)
  const monthlyRevenue = dailyRevenue * 26
  
  // Operating costs
  const cogsCost = monthlyRevenue * COST_STRUCTURE.COGS_PCT
  const laborCost = monthlyRevenue * COST_STRUCTURE.LABOR_PCT
  const overheadCost = monthlyRevenue * COST_STRUCTURE.OVERHEAD_PCT
  
  // Rent estimation
  const estimatedRent = (RENT_ESTIMATES[zone.toLowerCase().replace(/\s+/g, '_')] || RENT_ESTIMATES['default']) * seatingSize * 1.5 // Assume 50m² for seating
  const rentCost = estimatedRent
  
  const operatingCost = cogsCost + laborCost + overheadCost + rentCost
  
  // Monthly profit
  const monthlyProfit = monthlyRevenue - operatingCost
  
  // Annual
  const annualRevenue = monthlyRevenue * 12
  const annualProfit = monthlyProfit * 12
  
  // Startup cost
  const startupCost = seatingSize * type.costPerSeat
  
  // Break-even months
  const breakEvenMonths = startupCost > 0 && monthlyProfit > 0 
    ? Math.ceil(startupCost / monthlyProfit)
    : type.breakEvenMonths
  
  return {
    daily: {
      covers: dailyCovers,
      revenue: Math.round(dailyRevenue)
    },
    monthly: {
      revenue: Math.round(monthlyRevenue),
      operatingCost: Math.round(operatingCost),
      estimatedRent: Math.round(estimatedRent),
      profit: Math.round(monthlyProfit)
    },
    annual: {
      revenue: Math.round(annualRevenue),
      profit: Math.round(annualProfit)
    },
    avgCheck,
    startupCost,
    breakEvenMonths: Math.min(breakEvenMonths, 60) // Cap at 5 years
  }
}

/**
 * Kalkulasi revenue dengan scenario What-If
 */
export interface WhatIfScenario {
  label: string
  avgCheck?: number
  occupancyRate?: number
  seatingSize?: number
  cogsPct?: number
}

export interface WhatIfResult {
  base: { revenue: number; profit: number }
  scenarios: Array<{
    label: string
    revenue: number
    profit: number
    delta: { revenue: number; profit: number; pctChange: number }
  }>
}

export function calculateWhatIf(
  baseInput: RevenueInput,
  scenarios: WhatIfScenario[]
): WhatIfResult {
  const baseResult = calculateRevenue(baseInput)
  
  const scenarioResults = scenarios.map(scenario => {
    const modifiedInput: RevenueInput = {
      ...baseInput,
      avgCheckOverride: scenario.avgCheck || baseInput.avgCheckOverride,
      seatingSize: scenario.seatingSize || baseInput.seatingSize
    }
    
    // Override occupancy if specified
    if (scenario.occupancyRate) {
      const type = getRestaurantType(baseInput.restaurantType)
      const origOccupancy = type.occupancyRate
      // Adjust seating size to simulate occupancy change
      modifiedInput.seatingSize = Math.round((baseInput.seatingSize || 50) * (scenario.occupancyRate / origOccupancy))
    }
    
    const result = calculateRevenue(modifiedInput)
    
    const revenueDelta = result.monthly.revenue - baseResult.monthly.revenue
    const profitDelta = result.monthly.profit - baseResult.monthly.profit
    
    return {
      label: scenario.label,
      revenue: result.monthly.revenue,
      profit: result.monthly.profit,
      delta: {
        revenue: Math.round(revenueDelta),
        profit: Math.round(profitDelta),
        pctChange: baseResult.monthly.revenue > 0 
          ? Math.round((revenueDelta / baseResult.monthly.revenue) * 100)
          : 0
      }
    }
  })
  
  return {
    base: {
      revenue: baseResult.monthly.revenue,
      profit: baseResult.monthly.profit
    },
    scenarios: scenarioResults
  }
}
