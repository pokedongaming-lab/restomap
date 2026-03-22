'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

declare global {
  interface Window {
    google: typeof google
    initMap: () => void
  }
}

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

const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  jakarta: { lat: -6.2088, lng: 106.8456 },
  surabaya: { lat: -7.2575, lng: 112.7521 },
  bandung: { lat: -6.9175, lng: 107.6191 },
  bali: { lat: -8.4095, lng: 115.1889 },
  medan: { lat: 3.5952, lng: 98.6722 },
  makassar: { lat: -5.1477, lng: 119.4327 },
}

// Category emoji mapping
const CATEGORY_EMOJIS: Record<string, string> = {
  coffee: '☕',
  fastfood: '🍔',
  indonesian: '🍛',
  western: '🥩',
  japanese: '🍣',
  korean: '🥘',
  chinese: '🥡',
  bakery: '🧁',
  seafood: '🦐',
  ramen: '🍜',
  restaurant: '🍽️',
}

// Heatmap layer colors
const HEATMAP_COLORS: Record<string, string> = {
  population: '#3B82F6', // Blue
  traffic: '#F59E0B',   // Orange
  income: '#10B981',    // Green
}

export default function GoogleMapView({
  onPinChange,
  radius = 1000,
  initialCity = 'jakarta',
  heatmapLayers = [],
  heatmapData,
  competitors = [],
  onCompetitorClick,
}: Props) {
  const mapRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const circleRef = useRef<google.maps.Circle | null>(null)
  const competitorMarkersRef = useRef<google.maps.Marker[]>([])
  const heatmapCirclesRef = useRef<google.maps.Circle[]>([])
  const [address, setAddress] = useState<string>('')
  const [mapLoaded, setMapLoaded] = useState(false)

  // Initialize Google Maps
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google) {
      initMap()
      return
    }

    // Load Google Maps script
    const apiKey = 'AIzaSyAzlXgIm1ofUw-A26fQp0zylxczS8oNaJk'
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`
    script.async = true
    script.defer = true
    (window as any).initMap = initMap
    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (mapRef.current) {
        google.maps.event.clearInstanceListeners(mapRef.current)
      }
    }
  }, [])

  const initMap = () => {
    if (!window.google || mapRef.current) return

    const center = CITY_CENTERS[initialCity] || CITY_CENTERS.jakarta
    
    mapRef.current = new window.google.maps.Map(document.getElementById('google-map')!, {
      center,
      zoom: 14,
      mapId: 'restomap-map',
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    })

    // Add click listener
    mapRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat()
        const lng = e.latLng.lng()
        handleMapClick(lat, lng)
      }
    })

    setMapLoaded(true)
  }

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null)
    }

    // Remove existing circle
    if (circleRef.current) {
      circleRef.current.setMap(null)
    }

    // Create new marker
    markerRef.current = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapRef.current,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4F46E5',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
    })

    // Create radius circle
    circleRef.current = new window.google.maps.Circle({
      center: { lat, lng },
      radius: radius,
      map: mapRef.current,
      fillColor: '#4F46E5',
      fillOpacity: 0.1,
      strokeColor: '#4F46E5',
      strokeWeight: 2,
    })

    // Get address
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        setAddress(results[0].formatted_address)
        onPinChange?.({ lat, lng, address: results[0].formatted_address })
      } else {
        onPinChange?.({ lat, lng })
      }
    })

    // Pan to location
    mapRef.current.panTo({ lat, lng })
  }, [radius, onPinChange])

  // Update competitors
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    // Remove existing competitor markers
    competitorMarkersRef.current.forEach(m => m.setMap(null))
    competitorMarkersRef.current = []

    // Add new markers
    competitors.forEach(comp => {
      const emoji = CATEGORY_EMOJIS[comp.category] || '🍽️'
      
      const marker = new window.google.maps.Marker({
        position: { lat: comp.lat, lng: comp.lng },
        map: mapRef.current!,
        title: comp.name,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 10 7 10s7-4.75 7-10c0-3.87-3.13-7-7-7zm0 14c-2.67 0-5.33-1.33-7-3.5C3.67 10.67 2 8 2 5c0-4.42 3.58-8 8-8s8 3.58 8 8c0 3-1.67 5.67-3 7.5-1.67 2.17-4.33 3.5-7 3.5z',
          fillColor: '#8B5CF6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1,
          scale: 1.5,
          anchor: new window.google.maps.Point(12, 24),
        },
      })

      // Add click listener
      marker.addListener('click', () => {
        onCompetitorClick?.(comp)
      })

      competitorMarkersRef.current.push(marker)
    })
  }, [competitors, mapLoaded, onCompetitorClick])

  // Update heatmap circles
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !heatmapData || heatmapLayers.length === 0 || !markerRef.current) return

    const center = markerRef.current.getPosition()
    if (!center) return

    // Remove existing heatmap circles
    heatmapCirclesRef.current.forEach(c => c.setMap(null))
    heatmapCirclesRef.current = []

    // Draw heatmap circles
    heatmapLayers.forEach(layer => {
      const value = heatmapData[layer]
      if (value === undefined) return

      const color = HEATMAP_COLORS[layer] || '#3B82F6'
      const circleRadius = radius * 1.5

      const circle = new window.google.maps.Circle({
        center: center,
        radius: circleRadius,
        map: mapRef.current!,
        fillColor: color,
        fillOpacity: 0.35,
        strokeColor: color,
        strokeWeight: 3,
      })

      heatmapCirclesRef.current.push(circle)
    })
  }, [heatmapLayers, heatmapData, radius, mapLoaded])

  // Update radius circle when radius changes
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radius)
    }
  }, [radius])

  return (
    <div className="relative w-full h-full">
      <div id="google-map" className="w-full h-full rounded-lg" />
      
      {/* Address display */}
      {address && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-sm text-gray-600 line-clamp-2">{address}</p>
        </div>
      )}
    </div>
  )
}
