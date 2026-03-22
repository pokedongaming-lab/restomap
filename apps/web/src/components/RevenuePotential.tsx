'use client'

import { useEffect, useState } from 'react'

type Props = {
  lat: number
  lng: number
  radius: number
  category?: string | null
  competitorCount?: number
}

// TAM: Total Addressable Market (all coffee lovers globally - tidak realistis)
// SAM: Serviceable Addressable Market (population in radius yang potensial)
// SOM: Serviceable Obtainable Market (after competition)

// Category average spend per visit (IDR)
const CATEGORY_AVG_SPEND: Record<string, number> = {
  coffee: 35000,
  bakery: 45000,
  fastfood: 65000,
  indonesian: 55000,
  western: 85000,
  japanese: 95000,
  korean: 80000,
  chinese: 100000,
  seafood: 120000,
  ramen: 75000,
  italian: 110000,
  indian: 70000,
  thai: 65000,
  vietnamese: 60000,
  mexican: 75000,
  default: 50000,
}

// Category visit frequency per month
const CATEGORY_FREQUENCY: Record<string, number> = {
  coffee: 8,
  bakery: 4,
  fastfood: 5,
  indonesian: 12,
  western: 3,
  japanese: 4,
  korean: 3,
  chinese: 4,
  seafood: 2,
  ramen: 4,
  italian: 2,
  default: 4,
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
function estimateSAM(lat: number, lng: number, radiusMeters: number): number {
  const baseDensity = 15000 // Jakarta avg
  
  const centralJakarta = lat >= -6.22 && lat <= -6.18 && lng >= 106.81 && lng <= 106.84
  const southJakarta = lat < -6.23
  const densityMultiplier = centralJakarta ? 3 : southJakarta ? 1.5 : 2
  
  const radiusKm = radiusMeters / 1000
  const areaKm2 = Math.PI * radiusKm * radiusKm
  
  return Math.round(areaKm2 * baseDensity * densityMultiplier)
}

// Estimate SOM (Serviceable Obtainable Market) after competition
// SOM = SAM × Penetration Rate
// Penetration decreases with more competitors AND larger radius
function estimateSOM(sam: number, competitorCount: number, radiusMeters: number): { som: number; penetration: number; effectiveCompetitors: number } {
  const radiusKm = radiusMeters / 1000
  
  // Assume hidden competitors scale with area (not just visible ones)
  // More area = more hidden competitors to compete with
  const hiddenCompetitorFactor = Math.round(radiusKm * 2) // e.g., 5km = 10 hidden competitors
  const effectiveCompetitors = competitorCount + hiddenCompetitorFactor
  
  // Base penetration: 5% in small area
  // Decreases significantly with more competitors
  // In 1km: base 5%, each competitor reduces by 0.3%
  // In 10km: base 2%, each competitor reduces by 0.5%
  const basePenetration = radiusKm <= 2 ? 0.05 : radiusKm <= 5 ? 0.03 : 0.02
  const competitorPenalty = Math.min(basePenetration - 0.005, effectiveCompetitors * (radiusKm <= 2 ? 0.003 : 0.005))
  const penetration = Math.max(0.005, basePenetration - competitorPenalty)
  
  return {
    som: Math.round(sam * penetration),
    penetration: Math.round(penetration * 100),
    effectiveCompetitors,
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
  const { lat, lng, radius, competitorCount = 0 } = props
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    
    const incomeData = getIncomeLevel(lat, lng)
    const categorySpend = getCategorySpend(props.category)
    const avgSpend = Math.round(categorySpend * incomeData.multiplier)
    const visitFrequency = getCategoryFrequency(props.category)
    
    // TAM: Total hypothethical market (all people who like this category)
    // Assume 30% of population likes this category
    const sam = estimateSAM(lat, lng, radius)
    const tam = Math.round(sam / 0.3) // TAM = SAM / 0.3
    
    // SOM after competition - include radius for larger area penalty
    const { som, penetration, effectiveCompetitors } = estimateSOM(sam, competitorCount, radius)
    
    // Monthly visits = SOM × visit frequency
    const monthlyVisits = Math.round(som * visitFrequency)
    
    // Revenue = monthly visits × average spend
    const estimatedRevenue = monthlyVisits * avgSpend
    
    // Traffic score
    const traffic = (() => {
      const centralJakarta = lat >= -6.22 && lat <= -6.18 && lng >= 106.81 && lng <= 106.84
      const mainRoads = [
        { lat: -6.2, lng: 106.82 },
        { lat: -6.18, lng: 106.83 },
        { lat: -6.21, lng: 106.85 },
      ]
      const nearMainRoad = mainRoads.some(road => 
        Math.abs(lat - road.lat) < 0.015 && Math.abs(lng - road.lng) < 0.015
      )
      if (centralJakarta) return 85
      if (nearMainRoad) return 90
      if (lat < -6.25) return 60
      return 70
    })()
    
    const result: RevenueData = {
      tam,
      sam,
      som,
      penetration,
      effectiveCompetitors,
      traffic,
      incomeLevel: incomeData.level,
      avgSpend,
      monthlyVisits,
      estimatedRevenue,
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
