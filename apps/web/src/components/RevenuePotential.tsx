'use client'

import { useEffect, useState } from 'react'

type Props = {
  lat: number
  lng: number
  radius: number
  category?: string | null
  competitorCount?: number
}

type RevenueData = {
  population: number
  populationDensity: number
  traffic: number
  income: number
  incomeLevel: string
  avgSpend: number
  estimatedRevenue: number
  competitorCount: number
  competitionFactor: number
  marketShare: number
}

// Category average spend per visit (in IDR)
const CATEGORY_AVG_SPEND: Record<string, number> = {
  coffee: 35000,       // Kopi - rendah
  bakery: 45000,       // Bakery/snack
  fastfood: 65000,     // Fast food
  indonesian: 55000,   // Makanan Indonesia
  western: 85000,      // Western/fine dining
  japanese: 95000,     // Japanese
  korean: 80000,       // Korean
  chinese: 100000,     // Chinese - tinggi
  seafood: 120000,    // Seafood
  ramen: 75000,        // Ramen
  italian: 110000,    // Italian
  indian: 70000,      // Indian
  thai: 65000,        // Thai
  vietnamese: 60000,   // Vietnamese
  mexican: 75000,     // Mexican
  default: 50000,      // Default
}

// Simulated income level data based on Jakarta neighborhoods
function getIncomeLevel(lat: number, lng: number): { level: string; multiplier: number } {
  // Jakarta approximate income zones
  const southJakarta = lat < -6.25
  const centralJakarta = lat >= -6.2 && lat <= -6.15 && lng > 106.8
  const northJakarta = lat > -6.1
  const premiumAreas = [
    { lat: -6.2088, lng: 106.8456 }, // SCBD
    { lat: -6.2237, lng: 106.8092 }, // Sudirman
    { lat: -6.2301, lng: 106.8111 }, // Thamrin
  ]
  
  // Check if near premium areas
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

function estimatePopulation(lat: number, lng: number, radiusMeters: number): number {
  // Jakarta population density ~ 15,000 per km² average
  // But varies by area
  const baseDensity = 15000
  
  // Adjust based on location
  const centralJakarta = lat >= -6.22 && lat <= -6.18 && lng >= 106.81 && lng <= 106.84
  const southJakarta = lat < -6.23
  const densityMultiplier = centralJakarta ? 3 : southJakarta ? 1.5 : 2
  
  const radiusKm = radiusMeters / 1000
  const areaKm2 = Math.PI * radiusKm * radiusKm
  
  return Math.round(areaKm2 * baseDensity * densityMultiplier)
}

function estimateTraffic(lat: number, lng: number): number {
  // Traffic score 0-100
  const centralJakarta = lat >= -6.22 && lat <= -6.18 && lng >= 106.81 && lng <= 106.84
  const mainRoads = [
    { lat: -6.2, lng: 106.82 }, // Sudirman
    { lat: -6.18, lng: 106.83 }, // Thamrin
    { lat: -6.21, lng: 106.85 }, // MH Thamrin
  ]
  
  const nearMainRoad = mainRoads.some(road => 
    Math.abs(lat - road.lat) < 0.015 && Math.abs(lng - road.lng) < 0.015
  )
  
  if (centralJakarta) return 85
  if (nearMainRoad) return 90
  if (lat < -6.25) return 60 // South Jakarta
  return 70
}

export default function RevenuePotential(props: Props) {
  const { lat, lng, radius, competitorCount = 0 } = props
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    
    // Calculate revenue potential
    const population = estimatePopulation(lat, lng, radius)
    const traffic = estimateTraffic(lat, lng)
    const incomeData = getIncomeLevel(lat, lng)
    
    // Category-based spend
    const categorySpend = getCategorySpend(props.category)
    // Adjust by income multiplier
    const avgSpend = Math.round(categorySpend * incomeData.multiplier)
    
    // Get competitor count (passed from parent or estimate)
    const competitorCount = props.competitorCount ?? 0
    
    // Competition factor: more competitors = less market share
    // Base: 1 competitor = 50% market share, 10 competitors = 10% market share
    let competitionFactor = 1
    if (competitorCount > 0) {
      competitionFactor = Math.max(0.1, 1 - (competitorCount * 0.08))
    }
    
    // Market share calculation
    const marketShare = Math.round(competitionFactor * 100)
    
    // Revenue formula: population × (traffic/100) × avgSpend × conversionRate × 30 days × market share
    // Conversion rate: % of population that visits per day
    const conversionRate = 0.03 // 3% daily conversion (more realistic)
    const dailyVisitors = population * conversionRate * (traffic / 100)
    const estimatedRevenue = Math.round(dailyVisitors * avgSpend * 30 * competitionFactor)
    
    const result: RevenueData = {
      population,
      populationDensity: Math.round(population / (Math.PI * (radius / 1000) ** 2)),
      traffic,
      income: Math.round(incomeData.multiplier * 50),
      incomeLevel: incomeData.level,
      avgSpend,
      estimatedRevenue,
      competitorCount,
      competitionFactor,
      marketShare,
    }
    
    setData(result)
    setLoading(false)
  }, [lat, lng, radius, props.competitorCount])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
        <p className="text-sm text-indigo-600">Menghitung potensi revenue...</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `Rp ${(amount / 1000000000).toFixed(1)}M`
    } else if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(0)}jt`
    }
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
        <p className="font-semibold text-indigo-800">Potensi Revenue</p>
      </div>
      
      {/* Main Revenue */}
      <div className="text-center py-3 bg-white rounded-lg">
        <p className="text-xs text-gray-500 mb-1">Estimasi Revenue Bulanan</p>
        <p className="text-2xl font-bold text-green-600">
          {formatCurrency(data.estimatedRevenue)}
        </p>
        <p className="text-xs text-gray-400">
          {formatCurrency(Math.round(data.estimatedRevenue / 30))}/hari
        </p>
      </div>
      
      {/* Category Info */}
      <div className="bg-white/70 rounded-lg p-2 text-center">
        <p className="text-xs text-gray-500">Kategori</p>
        <p className="font-semibold text-indigo-700">{getCategoryLabel(props.category)}</p>
        <p className="text-xs text-gray-400">Avg spend: Rp {data.avgSpend.toLocaleString('id-ID')}/kunjungan</p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/70 rounded-lg p-2">
          <p className="text-xs text-gray-500">Populasi</p>
          <p className="font-semibold text-gray-800">
            {data.population >= 1000 ? `${(data.population / 1000).toFixed(0)}rb` : data.population}
          </p>
        </div>
        <div className="bg-white/70 rounded-lg p-2">
          <p className="text-xs text-gray-500">Traffic</p>
          <p className="font-semibold text-gray-800">{data.traffic}/100</p>
        </div>
        <div className="bg-white/70 rounded-lg p-2">
          <p className="text-xs text-gray-500">Income</p>
          <p className="font-semibold text-gray-800">{data.incomeLevel}</p>
        </div>
        <div className="bg-white/70 rounded-lg p-2">
          <p className="text-xs text-gray-500">Kompetitor</p>
          <p className="font-semibold text-gray-800">{data.competitorCount} bisnis</p>
        </div>
      </div>
      
      {/* Competition Impact */}
      <div className="bg-white/70 rounded-lg p-2 mt-2">
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs text-gray-500">Pangsa Pasar</p>
          <p className="font-semibold text-indigo-600">{data.marketShare}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-500 h-2 rounded-full" 
            style={{ width: `${data.marketShare}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Kompetitor: {data.competitorCount} → Faktor: {Math.round(data.competitionFactor * 100)}%
        </p>
      </div>
    </div>
  )
}
