'use client'

import { useEffect, useState } from 'react'

type Props = {
  lat: number
  lng: number
  radius: number
  category?: string | null
}

type RevenueData = {
  population: number
  populationDensity: number
  traffic: number
  income: number
  incomeLevel: string
  avgSpend: number
  estimatedRevenue: number
  conversionRate: number
}

// Simulated income level data based on Jakarta neighborhoods
function getIncomeLevel(lat: number, lng: number): { level: string; avgSpend: number; multiplier: number } {
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
    return { level: 'Tinggi', avgSpend: 150000, multiplier: 1.5 }
  } else if (centralJakarta) {
    return { level: 'Menengah Tinggi', avgSpend: 100000, multiplier: 1.2 }
  } else if (southJakarta) {
    return { level: 'Menengah', avgSpend: 75000, multiplier: 1.0 }
  } else if (northJakarta) {
    return { level: 'Menengah Rendah', avgSpend: 50000, multiplier: 0.8 }
  }
  return { level: 'Menengah', avgSpend: 75000, multiplier: 1.0 }
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

export default function RevenuePotential({ lat, lng, radius }: Props) {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    
    // Calculate revenue potential
    const population = estimatePopulation(lat, lng, radius)
    const traffic = estimateTraffic(lat, lng)
    const incomeData = getIncomeLevel(lat, lng)
    
    // Revenue formula: population × (traffic/100) × avgSpend × conversionRate × 30 days
    // Conversion rate: % of population that visits per day
    const conversionRate = 0.05 // 5% daily conversion
    const dailyVisitors = population * conversionRate * (traffic / 100)
    const estimatedRevenue = Math.round(dailyVisitors * incomeData.avgSpend * 30)
    
    const result: RevenueData = {
      population,
      populationDensity: Math.round(population / (Math.PI * (radius / 1000) ** 2)),
      traffic,
      income: Math.round(incomeData.multiplier * 50),
      incomeLevel: incomeData.level,
      avgSpend: incomeData.avgSpend,
      estimatedRevenue,
      conversionRate: conversionRate * 100,
    }
    
    setData(result)
    setLoading(false)
  }, [lat, lng, radius])

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
          <p className="text-xs text-gray-500">Avg Spend</p>
          <p className="font-semibold text-gray-800">Rp {data.avgSpend.toLocaleString('id-ID')}</p>
        </div>
      </div>
      
      {/* Conversion */}
      <div className="text-xs text-gray-500 text-center pt-2 border-t border-indigo-100">
        <p>Konversi: {data.conversionRate}% populasi × {data.traffic}% traffic</p>
      </div>
    </div>
  )
}
