'use client'

import { useState, useEffect } from 'react'

type Competitor = {
  placeId:    string
  name:       string
  category:   string
  rating:     number | null
  priceLevel: number | null
  address:    string
  lat:        number
  lng:        number
  distance:   number
  isOpen:     boolean | null
  photoRef:   string | null
}

type Props = {
  lat:      number
  lng:      number
  radius:   number
  category: string | null
  onHover?: (competitor: Competitor | null) => void
}

type SortKey = 'distance' | 'rating' | 'name'

const PRICE_LABELS = ['', '< 50rb', '50-100rb', '100-200rb', '200rb+']

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-gray-300">Belum ada rating</span>
  const full  = Math.floor(rating)
  const color = rating >= 4.5 ? 'text-green-500' : rating >= 4.0 ? 'text-amber-500' : 'text-gray-400'
  return (
    <span className={`text-xs font-semibold ${color}`}>
      ★ {rating.toFixed(1)}
    </span>
  )
}

export default function CompetitorList({ lat, lng, radius, category, onHover }: Props) {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [sort, setSort]               = useState<SortKey>('distance')
  const [source, setSource]           = useState<string>('')
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [placeDetails, setPlaceDetails] = useState<{ weekdayText: string[] | null } | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      lat:    lat.toString(),
      lng:    lng.toString(),
      radius: radius.toString(),
      ...(category ? { category } : {}),
    })

    fetch(`http://localhost:3001/competitors?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        if (!json.ok) throw new Error(json.error)
        setCompetitors(json.data.competitors)
        setSource(json.data.source)
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [lat, lng, radius, category])

  const fetchPlaceDetails = async (placeId: string) => {
    if (selectedPlaceId === placeId) {
      setSelectedPlaceId(null)
      setPlaceDetails(null)
      return
    }
    setSelectedPlaceId(placeId)
    setLoadingDetails(true)
    try {
      const res = await fetch(`http://localhost:3001/competitors/${placeId}/details`)
      const json = await res.json()
      if (json.ok) {
        setPlaceDetails(json.data)
      }
    } catch (e) {
      console.error('Error fetching place details:', e)
    } finally {
      setLoadingDetails(false)
    }
  }

  const sorted = [...competitors].sort((a, b) => {
    if (sort === 'distance') return a.distance - b.distance
    if (sort === 'rating')   return (b.rating ?? 0) - (a.rating ?? 0)
    return a.name.localeCompare(b.name)
  })

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-16" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-3 text-xs text-red-600 border border-red-100">
        ⚠️ {error}
      </div>
    )
  }

  if (competitors.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 text-center border border-dashed border-gray-200">
        <p className="text-gray-400 text-sm">Tidak ada kompetitor ditemukan</p>
        <p className="text-gray-300 text-xs mt-1">Coba perbesar radius analisa</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Header + sort */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {competitors.length} kompetitor
          {source === 'mock' && <span className="ml-1 text-amber-500">(demo data)</span>}
          {source === 'google_places' && <span className="ml-1 text-green-500">(Google Places)</span>}
        </p>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        >
          <option value="distance">Jarak</option>
          <option value="rating">Rating</option>
          <option value="name">Nama</option>
        </select>
      </div>

      {/* List */}
      {sorted.map((c) => (
        <div
          key={c.placeId}
          onMouseEnter={() => onHover?.(c)}
          onMouseLeave={() => onHover?.(null)}
          onClick={() => fetchPlaceDetails(c.placeId)}
          className={`bg-white border rounded-xl p-3 transition-all cursor-pointer ${
            selectedPlaceId === c.placeId 
              ? 'border-indigo-500 ring-1 ring-indigo-200' 
              : 'border-gray-200 hover:border-indigo-200'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 line-clamp-1">{c.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{c.address}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <StarRating rating={c.rating} />
                {c.priceLevel && (
                  <span className="text-xs text-gray-400">{PRICE_LABELS[c.priceLevel]}</span>
                )}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  c.isOpen === true  ? 'bg-green-100 text-green-600' :
                  c.isOpen === false ? 'bg-red-100 text-red-500' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {c.isOpen === true ? 'Buka' : c.isOpen === false ? 'Tutup' : '?'}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-semibold text-indigo-600">
                {c.distance >= 1000 ? `${(c.distance/1000).toFixed(1)}km` : `${c.distance}m`}
              </p>
              <p className="text-xs text-gray-300 mt-0.5">{c.category}</p>
            </div>
          </div>

          {/* Opening Hours - shown when selected */}
          {selectedPlaceId === c.placeId && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              {loadingDetails ? (
                <p className="text-xs text-gray-400">Memuat jam operasional...</p>
              ) : placeDetails?.weekdayText ? (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">🕐 Jam Operasional</p>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    {placeDetails.weekdayText.map((day, i) => (
                      <p key={i}>{day}</p>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400">Jam operasional tidak tersedia</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
