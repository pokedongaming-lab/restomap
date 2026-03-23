'use client'

import { useState } from 'react'

type Props = {
  lat: number
  lng: number
  heading?: number
  pitch?: number
  fov?: number
}

/**
 * Street View Preview Component
 * Embeds Google Street View Static API for location preview
 * 
 * Quick Win #1 - RestoSuite v2.0
 */
export default function StreetViewPreview({ 
  lat, 
  lng, 
  heading = 0, 
  pitch = 0,
  fov = 90 
}: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  // Google Street View Static API URL
  // Documentation: https://developers.google.com/maps/documentation/streetview/overview
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAzlXgIm1ofUw-A26fQp0zylxczS8oNaJk'
  
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=400x300&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${apiKey}`
  
  const handleLoad = () => {
    setLoading(false)
  }
  
  const handleError = () => {
    setLoading(false)
    setError(true)
  }
  
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-lime-400">
            📍 Street View
          </h3>
          <span className="text-xs text-gray-400">
            Google Street View
          </span>
        </div>
      </div>
      
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-gray-800">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-lime-400 border-t-transparent" />
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            <div>
              <p className="text-gray-400 text-sm mb-2">
                Street View tidak tersedia
              </p>
              <p className="text-gray-500 text-xs">
                Lokasi ini mungkin belum memiliki coverage Street View
              </p>
            </div>
          </div>
        ) : (
          <img
            src={streetViewUrl}
            alt={`Street view di ${lat.toFixed(4)}, ${lng.toFixed(4)}`}
            className="w-full h-full object-cover"
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />
        )}
        
        {/* Coordinates Overlay */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded-lg backdrop-blur-sm">
          <p className="text-xs text-gray-300 font-mono">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        </div>
      </div>
      
      {/* Info Footer */}
      <div className="px-4 py-3 bg-gray-800 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          💡 <span className="text-gray-300">Preview lokasi</span> — Gunakan untuk survey lokasi sebelum kunjungan langsung
        </p>
      </div>
    </div>
  )
}
