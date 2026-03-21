'use client'

import { useEffect, useRef, useState } from 'react'

export type MapPin = {
  lat: number
  lng: number
  address?: string
}

type Props = {
  onPinChange?: (pin: MapPin | null) => void
  radius?: number
  initialCity?: string
}

const CITY_CENTERS: Record<string, [number, number]> = {
  jakarta:  [-6.2088,  106.8456],
  surabaya: [-7.2575,  112.7521],
  bandung:  [-6.9175,  107.6191],
  bali:     [-8.4095,  115.1889],
  medan:    [ 3.5952,   98.6722],
  makassar: [-5.1477,  119.4327],
}

export default function MapView({ onPinChange, radius = 1000, initialCity = 'jakarta' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<any>(null)
  const markerRef    = useRef<any>(null)
  const circleRef    = useRef<any>(null)
  const initializedRef = useRef(false)
  const [address, setAddress] = useState('')

  useEffect(() => {
    // Guard: only initialize once
    if (initializedRef.current) return
    if (!containerRef.current) return
    initializedRef.current = true

    let L: any

    import('leaflet').then((mod) => {
      L = mod.default ?? mod

      // Fix broken marker icons in Next.js
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center = CITY_CENTERS[initialCity] ?? CITY_CENTERS.jakarta
      const map = L.map(containerRef.current, { zoomControl: true }).setView(center, 14)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map)
        }

        if (circleRef.current) {
          circleRef.current.setLatLng([lat, lng])
          circleRef.current.setRadius(radius)
        } else {
          circleRef.current = L.circle([lat, lng], {
            radius,
            color: '#4F46E5',
            fillColor: '#4F46E5',
            fillOpacity: 0.08,
            weight: 2,
          }).addTo(map)
        }

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
        circleRef.current = null
        initializedRef.current = false
      }
    }
  }, [])

  useEffect(() => {
    circleRef.current?.setRadius(radius)
  }, [radius])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-lg" />
      {address && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-md px-4 py-2 text-sm text-gray-700 z-[1000] max-w-sm">
          <span className="font-medium text-indigo-600">📍 </span>
          {address}
        </div>
      )}
    </div>
  )
}