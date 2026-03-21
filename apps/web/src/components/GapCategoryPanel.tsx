'use client'

import { useState, useEffect } from 'react'

type CategoryGap = {
  category: string
  label: string
  emoji: string
  count: number
  gapScore: number
  opportunity: 'High' | 'Medium' | 'Low'
  recommendation: string
  competitors: Array<{ name: string; rating: number; distance: number }>
}

type Props = {
  lat: number
  lng: number
  radius: number
}

export default function GapCategoryPanel({ lat, lng, radius }: Props) {
  const [data, setData] = useState<CategoryGap[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!lat || !lng) return

    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
    })

    fetch(`http://localhost:3001/gap-category?${params}`)
      .then(r => r.json())
      .then(json => {
        if (!json.ok) throw new Error(json.error)
        setData(json.data.categories)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [lat, lng, radius])

  if (!lat || !lng) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 text-center border border-dashed border-gray-200">
        <p className="text-gray-400 text-sm">Pilih lokasi terlebih dahulu</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-12" />
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

  const highOpportunity = data.filter(c => c.opportunity === 'High')
  const mediumOpportunity = data.filter(c => c.opportunity === 'Medium')

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Gap Kategori</h3>
        <span className="text-xs text-gray-400">{data.length} kategori</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-green-600">{highOpportunity.length}</p>
          <p className="text-xs text-green-600">Peluang Tinggi</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-amber-500">{mediumOpportunity.length}</p>
          <p className="text-xs text-amber-500">Sedang</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-gray-400">{data.length - highOpportunity.length - mediumOpportunity.length}</p>
          <p className="text-xs text-gray-400">Rendah</p>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-2">
        {data.slice(0, 6).map(cat => (
          <div
            key={cat.category}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            <div
              onClick={() => setExpanded(expanded === cat.category ? null : cat.category)}
              className="p-3 cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{cat.label}</p>
                    <p className="text-xs text-gray-400">{cat.count} kompetitor nearby</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    cat.opportunity === 'High' ? 'bg-green-100 text-green-600' :
                    cat.opportunity === 'Medium' ? 'bg-amber-100 text-amber-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {cat.gapScore}% gap
                  </span>
                  <span className="text-gray-400 text-xs">{expanded === cat.category ? '▲' : '▼'}</span>
                </div>
              </div>
            </div>

            {/* Expanded details */}
            {expanded === cat.category && (
              <div className="px-3 pb-3 border-t border-gray-100 pt-2">
                <p className="text-xs text-gray-600 mb-2">{cat.recommendation}</p>
                {cat.competitors.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500"> Kompetitor terdekat:</p>
                    {cat.competitors.map((c, i) => (
                      <p key={i} className="text-xs text-gray-400 flex justify-between">
                        <span>• {c.name}</span>
                        <span>★ {c.rating?.toFixed(1) || '-'} • {c.distance}m</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
