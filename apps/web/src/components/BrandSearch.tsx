'use client'

import { useState } from 'react'

type Props = {
  lat: number
  lng: number
  onSelectBrand: (brand: any) => void
}

export default function BrandSearch({ lat, lng, onSelectBrand }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const famousBrands = [
    // Quick access brands (shown as buttons)
    { name: 'Starbucks', category: 'coffee', emoji: '☕' },
    { name: 'Kopi Kenangan', category: 'coffee', emoji: '☕' },
    { name: 'Mixue', category: 'coffee', emoji: '☕' },
    { name: "McDonald's", category: 'fastfood', emoji: '🍔' },
    { name: 'KFC', category: 'fastfood', emoji: '🍔' },
    { name: 'Burger King', category: 'fastfood', emoji: '🍔' },
    { name: 'Pizza Hut', category: 'fastfood', emoji: '🍕' },
    { name: "Domino's Pizza", category: 'fastfood', emoji: '🍕' },
    { name: 'HokBen', category: 'japanese', emoji: '🍣' },
    { name: 'Sushi Tei', category: 'japanese', emoji: '🍣' },
    // All brands (for search)
    { name: 'Chatime', category: 'coffee', emoji: '☕' },
    { name: 'Kopi Janji Jiwa', category: 'coffee', emoji: '☕' },
    { name: 'Tea 77', category: 'coffee', emoji: '☕' },
    { name: 'Subway', category: 'fastfood', emoji: '🥪' },
    { name: 'Wendys', category: 'fastfood', emoji: '🍔' },
    { name: 'Texas Chicken', category: 'fastfood', emoji: '🍗' },
    { name: 'Popeyes', category: 'fastfood', emoji: '🍗' },
    { name: 'Bakmi GM', category: 'indonesian', emoji: '🍜' },
    { name: 'Solaria', category: 'indonesian', emoji: '🍛' },
    { name: 'A&W', category: 'fastfood', emoji: '🍔' },
    { name: 'Pizza Milano', category: 'italian', emoji: '🍕' },
    { name: 'Excelso', category: 'coffee', emoji: '☕' },
    { name: 'Tanamera', category: 'coffee', emoji: '☕' },
  ]
  
  const quickBrands = famousBrands.slice(0, 10) // First 10 for quick buttons

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    
    if (q.length >= 2) {
      // First show local matches
      const localFiltered = famousBrands.filter(b => 
        b.name.toLowerCase().includes(q.toLowerCase())
      )
      setResults(localFiltered)
      
      // Then search Google Places API
      setLoading(true)
      try {
        const res = await fetch(
          `http://localhost:3001/competitors/search?lat=${lat}&lng=${lng}&radius=50000&keyword=${encodeURIComponent(q)}`
        )
        const json = await res.json()
        if (json.ok && json.data?.competitors) {
          // Merge API results with local results
          const apiBrands = json.data.competitors.map((c: any) => ({
            name: c.name,
            category: 'search',
            emoji: '📍',
            placeId: c.placeId
          }))
          // Combine but prioritize unique names
          const combined = [...localFiltered]
          apiBrands.forEach((b: any) => {
            if (!combined.some(x => x.name === b.name)) {
              combined.push(b)
            }
          })
          setResults(combined.slice(0, 15))
        }
      } catch (err) {
        console.error('Search error:', err)
      }
      setLoading(false)
    } else {
      setResults([])
    }
  }

  const handleSelect = (brand: any) => {
    // Don't clear query - let the parent handle it
    onSelectBrand(brand)
    setResults([])
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Cari brand (Starbucks, KFC...)"
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      
      {results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {results.map((brand, i) => (
            <button
              key={i}
              onClick={() => handleSelect(brand)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 flex items-center gap-2"
            >
              <span>{brand.emoji}</span>
              <span>{brand.name}</span>
              <span className="text-xs text-gray-400">({brand.category})</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Quick Brand Buttons - search directly on click */}
      <div className="mt-2">
        <p className="text-xs text-gray-400 mb-1">Brand populer (klik untuk cari):</p>
        <div className="flex flex-wrap gap-1">
          {quickBrands.map((brand, i) => (
            <button
              key={i}
              type="button"
              onClick={async () => {
                // Clear and search directly
                setResults([])
                setLoading(true)
                try {
                  const res = await fetch(
                    `http://localhost:3001/competitors/search?lat=${lat}&lng=${lng}&radius=50000&keyword=${encodeURIComponent(brand.name)}`
                  )
                  const json = await res.json()
                  if (json.ok && json.data?.competitors) {
                    // Directly trigger parent with the search results
                    onSelectBrand({ name: brand.name, category: brand.category })
                  } else {
                    // Even if no results, still trigger
                    onSelectBrand({ name: brand.name, category: brand.category })
                  }
                } catch (err) {
                  console.error('Search error:', err)
                  // Still trigger even on error
                  onSelectBrand({ name: brand.name, category: brand.category })
                }
                setLoading(false)
              }}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-purple-100 hover:text-purple-700 rounded transition-colors border border-gray-200"
              title={`Cari ${brand.name} di area ini`}
            >
              {brand.emoji} {brand.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
