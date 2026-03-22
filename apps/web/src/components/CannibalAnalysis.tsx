'use client'

import { useMemo } from 'react'

type Competitor = {
  placeId: string
  name: string
  category: string
  rating: number | null
  lat: number
  lng: number
  distance: number
}

type Props = {
  lat: number
  lng: number
  radius: number
  category?: string | null
  competitors: Competitor[]
}

// Calculate distance between two points
function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

type Overlap = {
  competitor1: Competitor
  competitor2: Competitor
  distance: number
  overlapPercentage: number
  sharedCustomers: number
}

type CannibalScore = {
  competitor: Competitor
  cannibalScore: number
  riskLevel: 'low' | 'medium' | 'high'
  nearbyCompetitors: number
}

export default function CannibalAnalysis({ lat, lng, radius, category, competitors }: Props) {
  // Calculate overlaps between competitors
  const overlaps = useMemo((): Overlap[] => {
    if (competitors.length < 2) return []
    
    const result: Overlap[] = []
    const influenceRadius = radius / 1000 // km
    
    for (let i = 0; i < competitors.length; i++) {
      for (let j = i + 1; j < competitors.length; j++) {
        const c1 = competitors[i]
        const c2 = competitors[j]
        const distance = calcDistance(c1.lat, c1.lng, c2.lat, c2.lng)
        
        // If competitors are within influence radius, they overlap
        if (distance < influenceRadius) {
          const overlapPercentage = Math.round((1 - distance / influenceRadius) * 100)
          // Estimate shared customers (more overlap = more shared)
          const sharedCustomers = Math.round(overlapPercentage * 50)
          
          result.push({
            competitor1: c1,
            competitor2: c2,
            distance,
            overlapPercentage,
            sharedCustomers
          })
        }
      }
    }
    
    return result.sort((a, b) => b.overlapPercentage - a.overlapPercentage)
  }, [competitors, radius])

  // Calculate cannibalization risk for each competitor
  const cannibalScores = useMemo((): CannibalScore[] => {
    if (competitors.length === 0) return []
    
    const influenceRadius = radius / 1000
    
    return competitors.map(comp => {
      const nearby = competitors.filter(other => 
        other.placeId !== comp.placeId && 
        calcDistance(comp.lat, comp.lng, other.lat, other.lng) < influenceRadius
      ).length
      
      // Cannibal score: 0-100
      // Higher = more competition, higher risk
      let score = 0
      if (nearby >= 5) score = 80 + (nearby - 5) * 5
      else if (nearby >= 3) score = 50 + (nearby - 3) * 15
      else score = nearby * 15
      
      let risk: 'low' | 'medium' | 'high'
      if (score < 40) risk = 'low'
      else if (score < 70) risk = 'medium'
      else risk = 'high'
      
      return {
        competitor: comp,
        cannibalScore: Math.min(100, score),
        riskLevel: risk,
        nearbyCompetitors: nearby
      }
    }).sort((a, b) => b.cannibalScore - a.cannibalScore)
  }, [competitors, radius])

  // Overall market statistics
  const stats = useMemo(() => {
    const totalCompetitors = competitors.length
    const avgDistance = competitors.length > 1 
      ? competitors.reduce((sum, c, i) => {
          if (i === 0) return sum
          const prev = competitors[i-1]
          return sum + calcDistance(c.lat, c.lng, prev.lat, prev.lng)
        }, 0) / (competitors.length - 1)
      : 0
    
    // Market saturation: more competitors = higher saturation
    const areaKm2 = Math.PI * Math.pow(radius / 1000, 2)
    const density = totalCompetitors / areaKm2
    let saturation: 'low' | 'medium' | 'high'
    if (density < 0.5) saturation = 'low'
    else if (density < 2) saturation = 'medium'
    else saturation = 'high'
    
    const avgOverlap = overlaps.length > 0
      ? overlaps.reduce((sum, o) => sum + o.overlapPercentage, 0) / overlaps.length
      : 0
    
    return {
      totalCompetitors,
      avgDistance: avgDistance.toFixed(2),
      density: density.toFixed(2),
      saturation,
      totalOverlaps: overlaps.length,
      avgOverlap: Math.round(avgOverlap),
      highRiskCount: cannibalScores.filter(s => s.riskLevel === 'high').length
    }
  }, [competitors, radius, overlaps, cannibalScores])

  if (competitors.length === 0) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">⚔️</span>
          <p className="font-semibold text-red-800">Cannibalization Analysis</p>
        </div>
        <p className="text-sm text-gray-500">Pilih lokasi dan kategori untuk melihat analisis kanibal</p>
      </div>
    )
  }

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    if (risk === 'high') return 'bg-red-100 text-red-700 border-red-200'
    if (risk === 'medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-green-100 text-green-700 border-green-200'
  }

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-100 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚔️</span>
        <p className="font-semibold text-red-800">Cannibalization Analysis</p>
      </div>

      {/* Market Overview */}
      <div className="bg-white/70 rounded-lg p-3 space-y-2">
        <p className="text-xs font-medium text-gray-600">📊 Overview Pasar</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 rounded p-2">
            <p className="text-gray-500">Total Kompetitor</p>
            <p className="font-bold text-lg">{stats.totalCompetitors}</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="text-gray-500">Area Overlap</p>
            <p className="font-bold">{stats.avgOverlap}%</p>
          </div>
          <div className={`rounded p-2 ${stats.saturation === 'high' ? 'bg-red-100' : stats.saturation === 'medium' ? 'bg-yellow-100' : 'bg-green-100'}`}>
            <p className="text-gray-500">Saturasi</p>
            <p className="font-bold">{stats.saturation.toUpperCase()}</p>
          </div>
          <div className={`rounded p-2 ${stats.highRiskCount > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
            <p className="text-gray-500">High Risk</p>
            <p className="font-bold">{stats.highRiskCount}</p>
          </div>
        </div>
      </div>

      {/* Overlapping Competitors */}
      {overlaps.length > 0 && (
        <div className="bg-white/70 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-600 mb-2">🔄 Area Overlap (Berbagi Pelanggan)</p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {overlaps.slice(0, 5).map((overlap, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 rounded p-2">
                <div className="truncate flex-1">
                  <span className="font-medium">{overlap.competitor1.name.slice(0, 12)}</span>
                  <span className="text-gray-400 mx-1">↔</span>
                  <span className="font-medium">{overlap.competitor2.name.slice(0, 12)}</span>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded ${overlap.overlapPercentage > 50 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {overlap.overlapPercentage}%
                  </span>
                  <p className="text-gray-400 text-xs">{overlap.distance.toFixed(1)}km</p>
                </div>
              </div>
            ))}
          </div>
          {overlaps.length > 5 && (
            <p className="text-xs text-gray-400 mt-1">+{overlaps.length - 5} overlap lainnya</p>
          )}
        </div>
      )}

      {/* Risk Scores */}
      <div className="bg-white/70 rounded-lg p-3">
        <p className="text-xs font-medium text-gray-600 mb-2">⚠️ Risiko Kanibalisasi</p>
        <div className="space-y-2">
          {cannibalScores.slice(0, 5).map((item, idx) => (
            <div key={item.competitor.placeId} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-4">{idx + 1}.</span>
              <div className="flex-1 truncate">
                <p className="text-xs font-medium">{item.competitor.name.slice(0, 15)}</p>
                <p className="text-xs text-gray-400">{item.nearbyCompetitors} kompetitor nearby</p>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(item.riskLevel)}`}>
                {item.cannibalScore}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-red-50 rounded-lg p-3 text-xs">
        <p className="font-medium text-red-700">💡 Rekomendasi:</p>
        <p className="text-gray-600 mt-1">
          {stats.saturation === 'high' 
            ? 'Pasar sudah sangat penuh! Sulit untuk masuk tanpa kanibalisasi.'
            : stats.highRiskCount > 0
            ? `Ada ${stats.highRiskCount} lokasi dengan risiko tinggi. Perlu strategi differensiasi.`
            : 'Pasar masih layak untuk dimasuki dengan strategi yang tepat.'
          }
        </p>
      </div>
    </div>
  )
}
