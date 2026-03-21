'use client'

const CATEGORIES = [
  { value: null,        label: 'Semua',     emoji: '🍽️' },
  { value: 'coffee',   label: 'Kopi',       emoji: '☕' },
  { value: 'ramen',    label: 'Ramen',      emoji: '🍜' },
  { value: 'seafood',  label: 'Seafood',    emoji: '🦐' },
  { value: 'fastfood', label: 'Fast Food',  emoji: '🍔' },
  { value: 'indonesian', label: 'Indonesia', emoji: '🍛' },
  { value: 'western',  label: 'Western',    emoji: '🥩' },
  { value: 'chinese',  label: 'Chinese',    emoji: '🥟' },
  { value: 'japanese', label: 'Japanese',   emoji: '🍱' },
  { value: 'korean',   label: 'Korean',     emoji: '🥘' },
  { value: 'bakery',   label: 'Bakery',     emoji: '🧁' },
]

type Props = {
  value: string | null
  onChange: (category: string | null) => void
}

export default function CategoryFilter({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
        Kategori kuliner
      </p>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value ?? 'all'}
            onClick={() => onChange(cat.value)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              value === cat.value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
