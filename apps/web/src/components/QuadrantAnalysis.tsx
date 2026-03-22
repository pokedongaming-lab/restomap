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
}

type Props = {
  lat: number
  lng: number
  radius: number
  category?: string | null
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
