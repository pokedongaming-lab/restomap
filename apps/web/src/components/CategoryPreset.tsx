'use client'

import { useState } from 'react'

type Props = {
  value: string | null
  onChange: (category: string | null) => void
}

const CATEGORIES = [
  { id: 'coffee', label: 'Kopi', emoji: '☕', color: 'bg-amber-100 border-amber-300 text-amber-700' },
  { id: 'fastfood', label: 'Fast Food', emoji: '🍔', color: 'bg-orange-100 border-orange-300 text-orange-700' },
  { id: 'indonesian', label: 'Indonesian', emoji: '🍛', color: 'bg-red-100 border-red-300 text-red-700' },
  { id: 'western', label: 'Western', emoji: '🥩', color: 'bg-pink-100 border-pink-300 text-pink-700' },
  { id: 'japanese', label: 'Japanese', emoji: '🍣', color: 'bg-rose-100 border-rose-300 text-rose-700' },
  { id: 'korean', label: 'Korean', emoji: '🥘', color: 'bg-purple-100 border-purple-300 text-purple-700' },
  { id: 'chinese', label: 'Chinese', emoji: '🥢', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
  { id: 'seafood', label: 'Seafood', emoji: '🦐', color: 'bg-blue-100 border-blue-300 text-blue-700' },
  { id: 'ramen', label: 'Ramen', emoji: '🍜', color: 'bg-amber-100 border-amber-300 text-amber-700' },
  { id: 'bakery', label: 'Bakery', emoji: '🧁', color: 'bg-pink-100 border-pink-300 text-pink-700' },
  { id: 'italian', label: 'Italian', emoji: '🍕', color: 'bg-green-100 border-green-300 text-green-700' },
]

export default function CategoryPreset({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedCategory = CATEGORIES.find(c => c.id === value)
  
  return (
    <div className="relative">
      {/* Selected button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-2 px-3 rounded-lg border-2 text-sm font-medium flex items-center justify-between gap-2 transition-all ${
          value 
            ? selectedCategory?.color || 'bg-gray-100 border-gray-300' 
            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className="flex items-center gap-2">
          {selectedCategory ? (
            <>
              <span>{selectedCategory.emoji}</span>
              <span>{selectedCategory.label}</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>Semua Kategori</span>
            </>
          )}
        </span>
        <span className="text-xs">▼</span>
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {/* All option */}
          <button
            onClick={() => {
              onChange(null)
              setIsOpen(false)
            }}
            className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 ${
              !value ? 'bg-indigo-50 text-indigo-700' : ''
            }`}
          >
            <span>📋</span>
            <span>Semua Kategori</span>
          </button>
          
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                onChange(cat.id)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 ${
                value === cat.id ? `${cat.color} bg-opacity-50` : ''
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
