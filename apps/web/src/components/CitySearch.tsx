'use client'

import { useState, useRef } from 'react'

type SearchResult = {
  display_name: string
  lat: string
  lon: string
}

type Props = {
  onSelect: (lat: number, lng: number, name: string) => void
}

export default function CitySearch({ onSelect }: Props) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<SearchResult[]>([])
  const [loading, setLoading]   = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=id&limit=5`,
        { headers: { 'Accept-Language': 'id' } }
      )
      const data: SearchResult[] = await res.json()
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 400)
  }

  const handleSelect = (result: SearchResult) => {
    setQuery(result.display_name.split(',')[0])
    setResults([])
    onSelect(Number(result.lat), Number(result.lon), result.display_name)
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInput}
          placeholder="Cari kota atau area... (contoh: Jakarta Selatan)"
          className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     text-sm bg-white"
        />
        <span className="absolute left-3 top-3.5 text-gray-400 text-base">🔍</span>
        {loading && (
          <span className="absolute right-3 top-3.5 text-gray-400 text-xs">Mencari...</span>
        )}
      </div>

      {results.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200
                       shadow-lg z-[2000] overflow-hidden">
          {results.map((r, i) => (
            <li key={i}>
              <button
                onClick={() => handleSelect(r)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-indigo-50
                           border-b border-gray-100 last:border-0 transition-colors"
              >
                <span className="text-gray-500 mr-2">📍</span>
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
