'use client'

type Layer = 'population' | 'traffic' | 'income'

type Props = {
  active: Layer[]
  onChange: (layers: Layer[]) => void
}

const LAYERS: { key: Layer; label: string; color: string; emoji: string }[] = [
  { key: 'population', label: 'Kepadatan',  color: 'bg-blue-500',   emoji: '👥' },
  { key: 'traffic',    label: 'Traffic',    color: 'bg-amber-500',  emoji: '🚗' },
  { key: 'income',     label: 'Daya Beli',  color: 'bg-green-500',  emoji: '💰' },
]

export default function HeatmapToggle({ active, onChange }: Props) {
  const toggle = (layer: Layer) => {
    if (active.includes(layer)) {
      onChange(active.filter((l) => l !== layer))
    } else {
      onChange([...active, layer])
    }
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
        Layer heatmap
      </p>
      <div className="flex gap-2">
        {LAYERS.map((l) => {
          const isActive = active.includes(l.key)
          return (
            <button
              key={l.key}
              onClick={() => toggle(l.key)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 border ${
                isActive
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span>{l.emoji}</span>
              <span>{l.label}</span>
              <div className={`w-4 h-1 rounded-full ${isActive ? l.color : 'bg-gray-200'}`} />
            </button>
          )
        })}
      </div>
      {active.length > 0 && data && (
        <p className="text-xs text-green-600 mt-1.5 bg-green-50 rounded px-2 py-1">
          ✅ Data heatmap dari BPS Indonesia berhasil dimuat!
        </p>
      )}
    </div>
  )
}
