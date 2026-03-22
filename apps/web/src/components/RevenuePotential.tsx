'use client'

import { useEffect, useState } from 'react'

type Props = {
  lat: number
  lng: number
  radius: number
  category?: string | null
  competitorCount?: number
  bpsData?: {
    population: number
    income: number
    traffic: number
    competition: number
  } | null
}

// TAM: Total Addressable Market (all coffee lovers globally - tidak realistis)
// SAM: Serviceable Addressable Market (population in radius yang potensial)
// SOM: Serviceable Obtainable Market (after competition)

// Category average spend per visit (IDR) - based on market research
const CATEGORY_AVG_SPEND: Record<string, number> = {
  coffee: 40000,      // Mid-segment coffee: Rp 30-50k
  bakery: 45000,     // Bakery snacks
  fastfood: 65000,   // Fast food mid
  indonesian: 35000,  // Warung/Indonesian - lower spend
  western: 125000,    // Casual dining
  japanese: 100000,   // Japanese mid-high
  korean: 85000,     // Korean
  chinese: 90000,     // Chinese
  seafood: 150000,    // Seafood higher end
  ramen: 75000,      // Ramen
  italian: 150000,    // Italian fine dining
  indian: 65000,     // Indian
  thai: 60000,       // Thai
  vietnamese: 55000, // Vietnamese
  mexican: 75000,    // Mexican
  default: 50000,
}

// Category visit frequency per month (realistic based on market research)
const CATEGORY_FREQUENCY: Record<string, number> = {
  coffee: 10,       // Coffee shops: 8-12x/month
  bakery: 4,       // Bakery: 4x/month
  fastfood: 6,      // Fast food: 5-8x/month
  indonesian: 20,  // Warung: 20-30x/month (daily/weekly)
  western: 4,       // Casual dining: 3-5x/month
  japanese: 5,      // Japanese: 4-5x/month
  korean: 4,       // Korean: 3-4x/month
  chinese: 4,       // Chinese: 4x/month
  seafood: 3,       // Seafood: 2-3x/month
  ramen: 6,        // Ramen: 4-6x/month
  italian: 3,      // Italian: 2-3x/month
  default: 5,
}

// Market penetration rates (based on research)
const CATEGORY_PENETRATION: Record<string, number> = {
  coffee: 0.18,      // 18% of population
  bakery: 0.10,
  fastfood: 0.22,    // 22%
  indonesian: 0.40,  // 40% - most common
  western: 0.08,
  japanese: 0.12,
  korean: 0.08,
  chinese: 0.10,
  seafood: 0.05,
  ramen: 0.10,
  italian: 0.05,
  default: 0.15,
}

// Get income level based on location
function getIncomeLevel(lat: number, lng: number): { level: string; multiplier: number } {
  const southJakarta = lat < -6.25
  const centralJakarta = lat >= -6.2 && lat <= -6.15 && lng > 106.8
  const northJakarta = lat > -6.1
  const premiumAreas = [
    { lat: -6.2088, lng: 106.8456 }, // SCBD
    { lat: -6.2237, lng: 106.8092 }, // Sudirman
    { lat: -6.2301, lng: 106.8111 }, // Thamrin
  ]
  
  const isPremium = premiumAreas.some(area => 
    Math.abs(lat - area.lat) < 0.02 && Math.abs(lng - area.lng) < 0.02
  )
  
  if (isPremium || (southJakarta && lng > 106.83)) {
    return { level: 'Tinggi', multiplier: 1.5 }
  } else if (centralJakarta) {
    return { level: 'Menengah Tinggi', multiplier: 1.2 }
  } else if (southJakarta) {
    return { level: 'Menengah', multiplier: 1.0 }
  } else if (northJakarta) {
    return { level: 'Menengah Rendah', multiplier: 0.8 }
  }
  return { level: 'Menengah', multiplier: 1.0 }
}

function getCategorySpend(category: string | null | undefined): number {
  if (!category) return CATEGORY_AVG_SPEND.default
  return CATEGORY_AVG_SPEND[category.toLowerCase()] ?? CATEGORY_AVG_SPEND.default
}

function getCategoryFrequency(category: string | null | undefined): number {
  if (!category) return CATEGORY_FREQUENCY.default
  return CATEGORY_FREQUENCY[category.toLowerCase()] ?? CATEGORY_FREQUENCY.default
}

// Estimate SAM (Serviceable Addressable Market) - population in radius
function estimateSAM(lat: number, lng: number, radiusMeters: number, bpsScore?: number): number {
  const radiusKm = radiusMeters / 1000
  const areaKm2 = Math.PI * radiusKm * radiusKm
  
  // Use BPS population score if available (0-100)
  // Scale: BPS 50 = 15000/km², BPS 80 = 25000/km²
  let densityMultiplier = 2
  if (bpsScore) {
    densityMultiplier = 1 + (bpsScore / 50) // 1.5x to 2.5x
  } else {
    // Fallback to location-based
    const centralJakarta = lat >= -6.22 && lat <= -6.18 && lng >= 106.81 && lng <= 106.84
    const southJakarta = lat < -6.23
    densityMultiplier = centralJakarta ? 3 : southJakarta ? 1.5 : 2
  }
  
  const baseDensity = 15000
  return Math.round(areaKm2 * baseDensity * densityMultiplier)
}

// Estimate SOM (Serviceable Obtainable Market) after competition
// Based on market research: use category penetration rates
function estimateSOM(sam: number, competitorCount: number, radiusMeters: number, category?: string | null, bpsCompetition?: number): { 
  som: number; 
  penetration: number; 
  effectiveCompetitors: number 
} {
  const radiusKm = radiusMeters / 1000
  
  // Hidden competitors: for every km², assume ~8 hidden competitors not in Google
  const hiddenCompetitors = Math.round(radiusKm * radiusKm * 8)
  
  // Total competitors = visible + hidden
  const totalCompetitors = competitorCount + hiddenCompetitors
  
  // Get base penetration from category (market research data)
  let basePenetration = category ? (CATEGORY_PENETRATION[category.toLowerCase()] ?? 0.15) : 0.15
  
  // BPS competition score (0-100) further reduces penetration
  if (bpsCompetition) {
    // BPS 80 = 40% reduction in base penetration
    const reduction = (bpsCompetition / 100) * 0.4
    basePenetration = basePenetration * (1 - reduction)
  }
  
  // Competitor penalty: each visible competitor reduces penetration
  // Based on market research: competition is fierce in Jakarta
  const competitorPenalty = Math.min(
    basePenetration * 0.5, // Max 50% reduction
    competitorCount * 0.01 * basePenetration // 1% penalty per competitor
  )
  
  const penetration = Math.max(0.01, basePenetration - competitorPenalty) // min 1%
  
  return {
    som: Math.round(sam * penetration),
    penetration: Math.round(penetration * 100),
    effectiveCompetitors: totalCompetitors,
  }
}

type RevenueData = {
  // TAM (hypothetical max)
  tam: number
  // SAM (reachable market)
  sam: number
  // SOM (obtainable after competition)
  som: number
  penetration: number
  effectiveCompetitors: number
  // Metrics
  traffic: number
  incomeLevel: string
  avgSpend: number
  monthlyVisits: number
  estimatedRevenue: number
  competitorCount: number
}

export default function RevenuePotential(props: Props) {
  const { lat, lng, radius, competitorCount = 0, bpsData } = props
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    
    // Get category-specific data (PRIMARY)
    const categorySpend = getCategorySpend(props.category)
    const visitFrequency = getCategoryFrequency(props.category)
    const categoryPenetration = props.category 
      ? (CATEGORY_PENETRATION[props.category.toLowerCase()] ?? 0.15) 
      : 0.15
    
    // Get location-based adjustments
    const incomeData = getIncomeLevel(lat, lng)
    const avgSpend = Math.round(categorySpend * incomeData.multiplier) // Adjust by income
    
    // Calculate SAM based on population in radius (using location, not BPS)
    const sam = estimateSAM(lat, lng, radius, null)
    const tam = Math.round(sam / 0.3) // TAM = SAM / 0.3
    
    // Calculate SOM with category-based penetration
    // BPS competition is additional factor
    const bpsCompetition = bpsData?.competition
    let effectivePenetration = categoryPenetration
    
    // Reduce penetration if BPS shows high competition
    if (bpsCompetition && bpsCompetition > 60) {
      effectivePenetration = effectivePenetration * 0.7 // 30% reduction
    }
    
    // Reduce penetration based on visible competitors
    const competitorPenalty = Math.min(
      effectivePenetration * 0.5,
      competitorCount * 0.015 * effectivePenetration
    )
    const finalPenetration = Math.max(0.02, effectivePenetration - competitorPenalty)
    
    const som = Math.round(sam * finalPenetration)
    const penetration = Math.round(finalPenetration * 100)
    
    // Hidden competitors based on area
    const radiusKm = radius / 1000
    const hiddenCompetitors = Math.round(radiusKm * radiusKm * 5)
    const totalSaingan = competitorCount + hiddenCompetitors
    
    // Monthly visits = SOM × visit frequency
    const monthlyVisits = Math.round(som * visitFrequency)
    
    // Revenue = monthly visits × average spend
    const estimatedRevenue = monthlyVisits * avgSpend
    
    // Traffic score - use BPS if available, otherwise calculate
    const traffic = (() => {
      if (bpsData?.traffic) return bpsData.traffic
      
      const isCentral = lat >= -6.22 && lat <= -6.18 && lng >= 106.81 && lng <= 106.84
      const mainRoads = [
        { lat: -6.2, lng: 106.82 },
        { lat: -6.18, lng: 106.83 },
        { lat: -6.21, lng: 106.85 },
      ]
      const nearMainRoad = mainRoads.some(road => 
        Math.abs(lat - road.lat) < 0.015 && Math.abs(lng - road.lng) < 0.015
      )
      if (isCentral) return 85
      if (nearMainRoad) return 90
      if (lat < -6.25) return 60
      return 70
    })()
    
    // Realistic cap based on market research:
    // - Coffee shop: Rp 50-200M/month
    // - Fast food: Rp 100-400M/month
    // - Casual dining: Rp 150-500M/month
    const maxByCategory: Record<string, number> = {
      coffee: 200000000,
      bakery: 150000000,
      fastfood: 400000000,
      indonesian: 80000000,
      western: 500000000,
      japanese: 350000000,
      korean: 300000000,
      chinese: 350000000,
      seafood: 400000000,
      ramen: 250000000,
      italian: 500000000,
      default: 300000000,
    }
    const categoryKey = props.category?.toLowerCase() ?? 'default'
    const realisticMax = maxByCategory[categoryKey] ?? 300000000
    const cappedRevenue = Math.min(estimatedRevenue, realisticMax)
    
    const result: RevenueData = {
      tam,
      sam,
      som,
      penetration,
      effectiveCompetitors: totalSaingan,
      traffic,
      incomeLevel: incomeData.level,
      avgSpend,
      monthlyVisits,
      estimatedRevenue: cappedRevenue,
      competitorCount,
    }
    
    setData(result)
    setLoading(false)
  }, [lat, lng, radius, competitorCount, props.category])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
        <p className="text-sm text-indigo-600">Menghitung potensi revenue...</p>
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`
    return num.toString()
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}M`
    if (amount >= 1000000) return `Rp ${(amount / 1000000000).toFixed(1)}M` // Fixed
    if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(0)}jt`
    return `Rp ${(amount / 1000).toFixed(0)}rb`
  }

  const getCategoryLabel = (cat: string | null | undefined) => {
    const labels: Record<string, string> = {
      coffee: '☕ Kopi',
      bakery: '🧁 Bakery',
      fastfood: '🍔 Fast Food',
      indonesian: '🍛 Indonesia',
      western: '🥩 Western',
      japanese: '🍣 Japanese',
      korean: '🥘 Korean',
      chinese: '🥢 Chinese',
      seafood: '🦐 Seafood',
      ramen: '🍜 Ramen',
      italian: '🍕 Italian',
    }
    return cat ? (labels[cat.toLowerCase()] ?? cat) : 'Umum'
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">💰</span>
        <p className="font-semibold text-indigo-800">Potensi Revenue (TAM-SAM-SOM)</p>
      </div>
      
      {/* Category & Spend */}
      <div className="bg-white/70 rounded-lg p-2 text-center">
        <p className="font-semibold text-indigo-700">{getCategoryLabel(props.category)}</p>
        <p className="text-xs text-gray-400">ARPU: Rp {data.avgSpend.toLocaleString('id-ID')}/kunjungan • {data.monthlyVisits > 0 ? `${Math.round(data.monthlyVisits / data.som * 100)}x` : '0x'} per bulan</p>
      </div>

      {/* TAM SAM SOM Visualization */}
      <div className="space-y-2">
        {/* TAM */}
        <div className="bg-gray-100 rounded-lg p-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">TAM (Total Market)</span>
            <span className="font-medium">{formatNumber(data.tam)} orang</span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1">
            <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
        
        {/* SAM */}
        <div className="bg-blue-50 rounded-lg p-2">
          <div className="flex justify-between text-xs">
            <span className="text-blue-600">SAM (Radius {radius/1000}km)</span>
            <span className="font-medium text-blue-700">{formatNumber(data.sam)} orang</span>
          </div>
          <div className="w-full bg-blue-200 h-1.5 rounded-full mt-1">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (data.sam / data.tam) * 100)}%` }} />
          </div>
        </div>
        
        {/* SOM */}
        <div className="bg-green-50 rounded-lg p-2">
          <div className="flex justify-between text-xs">
            <span className="text-green-600 font-medium">SOM (Target Obtainable)</span>
            <span className="font-bold text-green-700">{formatNumber(data.som)} orang ({data.penetration}%)</span>
          </div>
          <div className="w-full bg-green-200 h-1.5 rounded-full mt-1">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (data.som / data.sam) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Main Revenue */}
      <div className="text-center py-3 bg-white rounded-lg border border-green-200">
        <p className="text-xs text-gray-500 mb-1">Estimasi Revenue Bulanan</p>
        <p className="text-2xl font-bold text-green-600">
          {formatCurrency(data.estimatedRevenue)}
        </p>
        <p className="text-xs text-gray-400">
          {formatCurrency(Math.round(data.estimatedRevenue / 30))}/hari • {formatNumber(data.monthlyVisits)} pengunjung/bulan
        </p>
      </div>

      {/* Competition Impact */}
      <div className="bg-white/70 rounded-lg p-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Kompetitor (terlihat):</span>
          <span className="font-medium">{data.competitorCount} bisnis</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-gray-500">Total saingan (radius):</span>
          <span className="font-medium text-red-600">{data.effectiveCompetitors} bisnis</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-gray-500">Market Penetration:</span>
          <span className="font-medium text-indigo-600">{data.penetration}%</span>
        </div>
      </div>

      {/* Formula Reference */}
      <div className="text-xs text-gray-400 text-center pt-1 border-t border-indigo-100">
        <p>Revenue = SOM ({formatNumber(data.som)}) × Frekuensi ({getCategoryFrequency(props.category)}x) × ARPU (Rp {data.avgSpend.toLocaleString('id-ID')})</p>
      </div>
    </div>
  )
}
