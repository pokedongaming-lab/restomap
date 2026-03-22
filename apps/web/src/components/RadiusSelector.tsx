'use client'

const RADIUS_OPTIONS = [
  { label: '500m', value: 500 },
  { label: '1km',  value: 1000 },
  { label: '2km',  value: 2000 },
  { label: '5km',  value: 5000 },
  { label: '10km', value: 10000 },
]

type Props = {
  value: number
  onChange: (radius: number) => void
}

export default function RadiusSelector({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
        Radius analisa
      </p>
      <div className="flex gap-2">
        {RADIUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              value === opt.value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
