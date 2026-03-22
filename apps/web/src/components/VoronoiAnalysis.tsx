'use client'

import { useState, useEffect, useMemo } from 'react'

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

// Simple Voronoi calculation using brute force (for small number of points)
// In production, would use d3-delaunay or similar library
function computeVoronoi(
  points: { x: number; y: number; data: any }[],
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
): { polygons: any[]; colors: string[] } {
  if (points.length === 0) return { polygons: [], colors: [] }
  
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8B500', '#00CED1', '#FF69B4', '#32CD32', '#FFD700'
  ]
  
  // Create polygons by assigning each cell to nearest point
  const gridSize = 50 // Resolution of the Voronoi grid
  const cellWidth = (bounds.maxX - bounds.minX) / gridSize
  const cellHeight = (bounds.maxY - bounds.minY) / gridSize
  
  const polygons: any[] = points.map((point, idx) => ({
    point: point.data,
    color: colors[idx % colors.length],
    center: { lat: point.data.lat, lng: point.data.lng }
  }))
  
  return { polygons, colors }
}

// Calculate bounding box for the competitors
function getBounds(competitors: Competitor[], centerLat: number, centerLng: number, radius: number): {
  minLat: number; maxLat: number; minLng: number; maxLng: number
} {
  const radiusDeg = radius / 111000 // Approximate degrees per meter
  
  return {
    minLat: centerLat - radiusDeg,
    maxLat: centerLat + radiusDeg,
    minLng: centerLng - radiusDeg / Math.cos(centerLat * Math.PI / 180),
    maxLng: centerLng + radiusDeg / Math.cos(centerLat * Math.PI / 180)
  }
}

// Assign each grid point to nearest competitor
function assignToNearest(
  competitors: Competitor[],
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  gridSize: number
): number[][] {
  const latStep = (bounds.maxLat - bounds.minLat) / gridSize
  const lngStep = (bounds.maxLng - bounds.minLng) / gridSize
  
  const grid: number[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(-1))
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const lat = bounds.maxLat - (i + 0.5) * latStep
      const lng = bounds.minLng + (j + 0.5) * lngStep
      
      let minDist = Infinity
      let nearestIdx = -1
      
      competitors.forEach((comp, idx) => {
        const dist = Math.sqrt(
          Math.pow(comp.lat - lat, 2) + Math.pow(comp.lng - lng, 2)
        )
        if (dist < minDist) {
          minDist = dist
          nearestIdx = idx
        }
      })
      
      grid[i][j] = nearestIdx
    }
  }
  
  return grid
}

export default function VoronoiAnalysis({ lat, lng, radius, category, competitors }: Props) {
  const [showVoronoi, setShowVoronoi] = useState(false)
  const [grid, setGrid] = useState<number[][]>([])
  const [colors] = useState<string[]>([
    'rgba(255, 107, 107, 0.3)', 'rgba(78, 205, 196, 0.3)', 'rgba(69, 183, 209, 0.3)',
    'rgba(150, 206, 180, 0.3)', 'rgba(255, 234, 167, 0.3)', 'rgba(221, 160, 221, 0.3)',
    'rgba(152, 216, 200, 0.3)', 'rgba(247, 220, 111, 0.3)', 'rgba(187, 143, 206, 0.3)',
    'rgba(133, 193, 233, 0.3)', 'rgba(248, 181, 0, 0.3)', 'rgba(0, 206, 209, 0.3)',
  ])

  useEffect(() => {
    if (competitors.length === 0 || !showVoronoi) {
      setGrid([])
      return
    }
    
    const bounds = getBounds(competitors, lat, lng, radius)
    const gridSize = 30 // 30x30 grid for performance
    const newGrid = assignToNearest(competitors, bounds, gridSize)
    setGrid(newGrid)
  }, [competitors, showVoronoi, lat, lng, radius])

  // Calculate catchment area statistics
  const catchmentStats = useMemo(() => {
    if (competitors.length === 0) return null
    
    const totalArea = Math.PI * Math.pow(radius / 1000, 2) // km²
    const avgAreaPerCompetitor = totalArea / competitors.length
    
    // Estimate population in each catchment
    const baseDensity = 15000 // Jakarta average
    const estimatedPopPerCompetitor = Math.round(avgAreaPerCompetitor * baseDensity)
    
    return {
      totalCompetitors: competitors.length,
      radiusKm: radius / 1000,
      totalAreaKm2: Math.round(totalArea),
      avgAreaKm2: Math.round(avgAreaPerCompetitor),
      estimatedPopPerCompetitor,
      recommendation: getCatchmentRecommendation(competitors.length, avgAreaPerCompetitor)
    }
  }, [competitors, radius])

  const getCatchmentRecommendation = (count: number, avgArea: number): string => {
    if (count === 0) return 'Tidak ada kompetitor - opportunity tinggi!'
    if (count <= 3 && avgArea > 5) return 'Sedikit kompetitor, area luas - potensi tinggi!'
    if (count <= 5 && avgArea > 3) return 'Kompetisi sedang - masih ada peluang.'
    if (count <= 10) return 'Kompetisi cukup ketat - perlu differensiasi.'
    return 'Kompetisi sangat ketat - sulit untuk masuk.'
  }

  if (competitors.length === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🎯</span>
          <p className="font-semibold text-purple-800">Voronoi Analysis</p>
        </div>
        <p className="text-sm text-gray-500">Pilih lokasi dan kategori untuk melihat analisis Voronoi</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <p className="font-semibold text-purple-800">Voronoi Analysis</p>
        </div>
        <button
          onClick={() => setShowVoronoi(!showVoronoi)}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            showVoronoi 
              ? 'bg-purple-600 text-white' 
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }`}
        >
          {showVoronoi ? 'Sembunyikan' : 'Tampilkan'}
        </button>
      </div>

      {/* Catchment Area Stats */}
      {catchmentStats && (
        <div className="bg-white/70 rounded-lg p-3 space-y-2">
          <p className="text-xs font-medium text-gray-600">📊 Statistik Catchment Area</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 rounded p-2">
              <p className="text-gray-500">Total Kompetitor</p>
              <p className="font-bold text-lg">{catchmentStats.totalCompetitors}</p>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <p className="text-gray-500">Radius</p>
              <p className="font-bold">{catchmentStats.radiusKm} km</p>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <p className="text-gray-500">Total Area</p>
              <p className="font-bold">{catchmentStats.totalAreaKm2} km²</p>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <p className="text-gray-500">Rata-rata Area/Kompetitor</p>
              <p className="font-bold">{catchmentStats.avgAreaKm2} km²</p>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded p-2 text-xs">
            <p className="font-medium text-purple-700">💡 Rekomendasi:</p>
            <p className="text-gray-600">{catchmentStats.recommendation}</p>
          </div>
        </div>
      )}

      {/* Legend */}
      {showVoronoi && competitors.length > 0 && (
        <div className="bg-white/70 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-600 mb-2">Legenda Catchment Area:</p>
          <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
            {competitors.slice(0, 10).map((comp, idx) => (
              <div key={comp.placeId} className="flex items-center gap-1 text-xs">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: colors[idx % colors.length] }}
                />
                <span className="truncate">{comp.name.slice(0, 15)}</span>
                {comp.rating && <span className="text-gray-400">★{comp.rating}</span>}
              </div>
            ))}
          </div>
          {competitors.length > 10 && (
            <p className="text-xs text-gray-400 mt-1">+{competitors.length - 10} lainnya...</p>
          )}
        </div>
      )}

      {/* Explanation */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
        <p className="font-medium">Apa itu Voronoi?</p>
        <p className="mt-1">
          Voronoi membagi area berdasarkan jarak ke kompetitor terdekat. 
          Setiap wilayah menunjukkan "catchment area" - area mana yang paling dekat dengan kompetitor tersebut.
        </p>
      </div>
    </div>
  )
}
