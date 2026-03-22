'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export type MapPin = {
  lat: number
  lng: number
  address?: string
}

export type MapCompetitor = {
  placeId: string
  name: string
  category: string
  rating: number | null
  lat: number
  lng: number
}

export type HeatmapFactors = {
  population: number
  traffic: number
  income: number
}

type Props = {
  onPinChange?: (pin: MapPin | null) => void
  radius?: number
  initialCity?: string
  heatmapLayers?: ('population' | 'traffic' | 'income')[]
  heatmapData?: HeatmapFactors | null
  competitors?: MapCompetitor[]
  onCompetitorClick?: (competitor: MapCompetitor) => void
}

const CITY_CENTERS: Record<string, [number, number]> = {
  jakarta:  [-6.2088,  106.8456],
  surabaya: [-7.2575, 112.7521],
  bandung:  [-6.9175, 107.6191],
  bali:     [-8.4095, 115.1889],
  medan:    [ 3.5952,   98.6722],
  makassar: [-5.1477, 119.4327],
}

// Color scale: blue (low) -> yellow (medium) -> red (high)
function getHeatmapColor(value: number): string {
  if (value >= 70) return '#EF4444'      // Red - high
  if (value >= 40) return '#F59E0B'      // Yellow - medium
  return '#3B82F6'                        // Blue - low
}

function getHeatmapOpacity(value: number): number {
  return 0.15 + (value / 100) * 0.35     // 0.15 to 0.5
}

export default function MapView({
  onPinChange,
  radius = 1000,
  initialCity = 'jakarta',
  heatmapLayers = [],
  heatmapData,
  competitors = [],
  onCompetitorClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<any>(null)
  const markerRef    = useRef<any>(null)
  const circleRefs   = useRef<any[]>([])
  const competitorMarkerRefs = useRef<any[]>([])
  const initializedRef = useRef(false)
  const [address, setAddress] = useState('')

  // Handle flyto event from outside component
  const handleFlyto = useCallback((e: Event) => {
    const detail = (e as CustomEvent).detail
    if (detail?.lat && detail?.lng && mapRef.current) {
      mapRef.current.setView([detail.lat, detail.lng], 14)
      if (markerRef.current) {
        markerRef.current.setLatLng([detail.lat, detail.lng])
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('restomap:flyto', handleFlyto)
    return () => {
      window.removeEventListener('restomap:flyto', handleFlyto)
    }
  }, [handleFlyto])

  // Add competitor markers to map
  useEffect(() => {
    if (!mapRef.current || !competitors.length) return

    // Remove existing competitor markers
    if (competitorMarkerRefs.current) {
      competitorMarkerRefs.current.forEach(m => m.remove())
    }
    competitorMarkerRefs.current = []

    // Category emoji mapping
    const categoryEmojis: Record<string, string> = {
      coffee: '☕',
      fastfood: '🍔',
      indonesian: '🍛',
      western: '🍔',
      japanese: '🍣',
      korean: '🍜',
      chinese: '🥡',
      bakery: '🍞',
      seafood: '🦐',
      ramen: '🍜',
      restaurant: '🍽️',
    }

    // Add markers for each competitor
    competitors.forEach(comp => {
      const emoji = categoryEmojis[comp.category] || '🍽️'

      // Create custom icon with emoji
      const icon = L.divIcon({
        className: 'competitor-marker',
        html: `<div style="
          background: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          border: 2px solid #4F46E5;
        ">${emoji}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = L.marker([comp.lat, comp.lng], { icon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="min-width: 150px;">
            <strong style="font-size: 14px;">${comp.name}</strong>
            <br/>
            <span style="color: #666; font-size: 12px;">${comp.category}</span>
            ${comp.rating ? `<br/><span style="color: #F59E0B;">⭐ ${comp.rating}</span>` : ''}
          </div>
        `)
        .on('click', () => {
          onCompetitorClick?.(comp)
        })

      competitorMarkerRefs.current?.push(marker)
    })

    return () => {
      if (competitorMarkerRefs.current) {
        competitorMarkerRefs.current.forEach(m => m.remove())
      }
    }
  }, [competitors, onCompetitorClick])

  // Update heatmap visualization when data changes
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing heatmap layers
    circleRefs.current.forEach(c => c.remove())
    circleRefs.current = []

    // If no heatmap data, return
    if (!heatmapData || heatmapLayers.length === 0) {
      return
    }

    // Get center from marker or use default
    let centerLat = -6.2
    let centerLng = 106.8

    if (markerRef.current) {
      const markerPos = markerRef.current.getLatLng()
      centerLat = markerPos.lat
      centerLng = markerPos.lng
    }

    // Create heatmap overlay using CircleMarker (pixel-based, always visible)
    heatmapLayers.forEach(layer => {
      const value = heatmapData[layer]
      if (value === undefined) return

      // Color based on layer type
      let color: string
      if (layer === 'income') {
        color = '#22C55E' // Green
      } else if (layer === 'traffic') {
        color = '#F59E0B' // Orange
      } else {
        color = '#EF4444' // Red
      }

      // Use Circle with radius in meters (proper geographic scaling)
      const circleRadius = radius * 1.5
      
      const circle = (window as any).L.circle([centerLat, centerLng], {
        radius: circleRadius,
        fillColor: color,
        color: color,
        weight: 3,
        fillOpacity: 0.4,
        opacity: 0.8,
      }).addTo(mapRef.current)

      circle.bringToFront()
      circleRefs.current.push(circle)
    })
  }, [heatmapLayers, heatmapData, radius])

  useEffect(() => {
    if (initializedRef.current) return
    if (!containerRef.current) return
    initializedRef.current = true

    let L: any
    let map: any

    import('leaflet').then((mod) => {
      L = mod.default ?? mod

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center = CITY_CENTERS[initialCity] ?? CITY_CENTERS.jakarta
      map = L.map(containerRef.current, { zoomControl: true }).setView(center, 14)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng

        // Clear heatmap circles when clicking new location
        circleRefs.current.forEach(c => c.remove())
        circleRefs.current = []

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map)
        }

        const radiusCircle = L.circle([lat, lng], {
          radius,
          color: '#4F46E5',
          fillColor: '#4F46E5',
          fillOpacity: 0.08,
          weight: 2,
        }).addTo(map)
        circleRefs.current.push(radiusCircle)

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'id' } }
          )
          const data = await res.json()
          const addr = data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
          setAddress(addr)
          onPinChange?.({ lat, lng, address: addr })
        } catch {
          onPinChange?.({ lat, lng })
        }
      })
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
        circleRefs.current = []
        initializedRef.current = false
      }
    }
  }, [])

  useEffect(() => {
    if (circleRefs.current[0]) {
      circleRefs.current[0].setRadius(radius)
    }
  }, [radius])

  return (
    <div className="relative w-full h-full z-0">
      <div ref={containerRef} className="w-full h-full rounded-lg z-0" />

      {/* Heatmap legend */}
      {heatmapLayers.length > 0 && heatmapData && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 text-xs z-[1000] shadow-md">
          <p className="font-semibold mb-2">Heatmap Legend</p>
          <div className="space-y-1">
            {heatmapLayers.map(layer => {
              const value = heatmapData[layer]
              const color = getHeatmapColor(value)
              const labels: Record<string, string> = {
                population: '👥 Kepadatan',
                traffic: '🚗 Traffic',
                income: '💰 Daya Beli'
              }
              return (
                <div key={layer} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span>{labels[layer]}: {value}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {address && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-md px-4 py-2 text-sm text-gray-700 z-[1000] max-w-sm">
          <span className="font-medium text-indigo-600">📍 </span>
          {address}
        </div>
      )}
    </div>
  )
}
