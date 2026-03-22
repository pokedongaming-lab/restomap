'use client'

import { useState, useEffect } from 'react'

type QuadrantData = {
  summary: {
    totalCompetitors: number
    medianRating: number
    medianReviews: number
    quadrantCounts: Record<string, number>
    quadrantPercentages: Record<string, number>
  }
  quadrants: Record<string, {
    label: string
    emoji: string
    desc: string
    strategy: string
    competitors: any[]
  }>
  bpsFactors?: {
    population: number
    income: number
    traffic: number
    competition: number
  }
}

type Props = {
  lat: number
  lng: number
  radius: number
  category?: string | null
}

// Smart recommendation based on BPS factors
function getBPSRecommendation(bps: { population: number; income: number; traffic: number; competition: number }): string {
  const scores = []
  
  // Population/Density score (higher = more customers)
  if (bps.population > 60) scores.push('Kepadatan tinggi (+)')
  else if (bps.population < 40) scores.push('Kepadatan rendah (-)')
  
  // Income score (higher = higher spend)
  if (bps.income > 60) scores.push('Daya beli tinggi (+)')
  else if (bps.income < 40) scores.push('Daya beli rendah (-)')
  
  // Traffic score (higher = more foot traffic)
  if (bps.traffic > 60) scores.push('Traffic tinggi (+)')
  else if (bps.traffic < 40) scores.push('Traffic rendah (-)')
  
  // Competition (lower = less competition)
  if (bps.competition < 40) scores.push('Kompetisi rendah (+)')
  else if (bps.competition > 60) scores.push('Kompetisi tinggi (-)')
  
  // Overall assessment
  const positive = scores.filter(s => s.includes('(+)')).length
  const negative = scores.filter(s => s.includes('(-)')).length
  
  if (positive >= 3) return 'Area sangat potensial! Segera bertindak.'
  if (positive > negative) return 'Area cukup potensial, layak dipertimbangkan.'
  if (negative > positive) return 'Area kurang potensial, perlu hati-hati.'
  return 'Area netral, perlu analisis lebih lanjut.'
}

export default function QuadrantAnalysis({ lat, lng, radius, category }: Props) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<QuadrantData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null)

  useEffect(() => {
    fetchQuadrantData()
  }, [lat, lng, radius, category])

  const fetchQuadrantData = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        radius: radius.toString(),
      })
      if (category) params.set('category', category)

      const res = await fetch(`http://localhost:3001/quadrant/analyze?${params}`)
      const json = await res.json()

      if (!json.ok) {
        throw new Error(json.error || 'Failed to fetch quadrant data')
      }

      setData(json.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'hidden_gems':
        return 'bg-purple-100 border-purple-300 text-purple-800'
      case 'populars':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'underperformers':
        return 'bg-red-100 border-red-300 text-red-800'
      case 'public_critics':
        return 'bg-amber-100 border-amber-300 text-amber-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getQuadrantEmoji = (quadrant: string) => {
    switch (quadrant) {
      case 'hidden_gems': return '💎'
      case 'populars': return '⭐'
      case 'underperformers': return '📉'
      case 'public_critics': return '📝'
      default: return '❓'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-4 border border-red-100">
        <p className="text-red-600 text-sm">⚠️ {error}</p>
        <button
          onClick={fetchQuadrantData}
          className="mt-2 text-xs text-red-500 underline"
        >
          Coba lagi
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-3">
          📊 Quadrant Analysis
        </h3>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-indigo-600">{data.summary.totalCompetitors}</p>
            <p className="text-xs text-gray-500">Competitors</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-indigo-600">{data.summary.medianRating}</p>
            <p className="text-xs text-gray-500">Median Rating</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-indigo-600">{data.summary.medianReviews}</p>
            <p className="text-xs text-gray-500">Median Reviews</p>
          </div>
        </div>

        {/* BPS Factors Analysis */}
        {data.bpsFactors && (
          <div className="bg-blue-50 rounded-lg p-3 mb-3">
            <p className="text-xs font-semibold text-blue-700 mb-2">📊 Analisis Lokasi (BPS)</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className={`p-2 rounded ${data.bpsFactors.population > 60 ? 'bg-green-100' : data.bpsFactors.population > 40 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <p className="text-lg font-bold">{data.bpsFactors.population}</p>
                <p className="text-xs">Kepadatan</p>
              </div>
              <div className={`p-2 rounded ${data.bpsFactors.income > 60 ? 'bg-green-100' : data.bpsFactors.income > 40 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <p className="text-lg font-bold">{data.bpsFactors.income}</p>
                <p className="text-xs">Daya Beli</p>
              </div>
              <div className={`p-2 rounded ${data.bpsFactors.traffic > 60 ? 'bg-green-100' : data.bpsFactors.traffic > 40 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <p className="text-lg font-bold">{data.bpsFactors.traffic}</p>
                <p className="text-xs">Traffic</p>
              </div>
              <div className={`p-2 rounded ${data.bpsFactors.competition < 40 ? 'bg-green-100' : data.bpsFactors.competition < 60 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <p className="text-lg font-bold">{data.bpsFactors.competition}</p>
                <p className="text-xs">Kompetisi</p>
              </div>
            </div>
            {/* Smart Recommendation based on BPS */}
            <div className="mt-2 p-2 bg-white/70 rounded text-xs">
              <p className="font-semibold">💡 Rekomendasi:</p>
              <p>{getBPSRecommendation(data.bpsFactors)}</p>
            </div>
          </div>
        )}

        {/* Quadrant Cards */}
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(data.summary.quadrantCounts).map(([key, count]) => {
            const percentage = data.summary.quadrantPercentages[key]
            const isSelected = selectedQuadrant === key
            
            return (
              <button
                key={key}
                onClick={() => setSelectedQuadrant(isSelected ? null : key)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'
                } ${getQuadrantColor(key)}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{getQuadrantEmoji(key)}</span>
                  <span className="font-semibold text-sm">{data.quadrants[key]?.label || key}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{count}</span>
                  <span className="text-xs opacity-75">{percentage}%</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Quadrant Detail */}
      {selectedQuadrant && data.quadrants[selectedQuadrant] && (
        <div className={`rounded-xl p-4 border-2 ${getQuadrantColor(selectedQuadrant)}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getQuadrantEmoji(selectedQuadrant)}</span>
            <h4 className="font-bold">{data.quadrants[selectedQuadrant].label}</h4>
          </div>
          
          <p className="text-sm mb-2 opacity-80">
            {data.quadrants[selectedQuadrant].desc}
          </p>
          
          <div className="bg-white/50 rounded-lg p-2 mb-3">
            <p className="text-xs font-medium mb-1">💡 Strategy:</p>
            <p className="text-sm">{data.quadrants[selectedQuadrant].strategy}</p>
          </div>

          {/* Competitors in this quadrant */}
          <div className="space-y-2">
            <p className="text-xs font-medium">Top places:</p>
            {data.quadrants[selectedQuadrant].competitors.slice(0, 5).map((comp: any, i: number) => (
              <div key={i} className="bg-white/60 rounded-lg p-2 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{comp.name}</p>
                  <p className="text-xs text-gray-500">{comp.distance}m away</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">⭐ {comp.rating || '-'}</p>
                  <p className="text-xs text-gray-400">{comp.userRatingsTotal} reviews</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
