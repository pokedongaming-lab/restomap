'use client'

import { useState } from 'react'
import type { HeatmapData } from '@/hooks/useHeatmap'

type Layer = 'population' | 'traffic' | 'income'

type Props = {
  active: Layer[]
  onChange: (layers: Layer[]) => void
  data?: HeatmapData | null
  loading?: boolean
}

const LAYERS: { key: Layer; label: string; color: string; emoji: string; desc: string }[] = [
  { key: 'population', label: 'Kepadatan',  color: 'bg-blue-500',   emoji: '👥', desc: 'Jumlah penduduk per area' },
  { key: 'traffic',    label: 'Traffic',    color: 'bg-amber-500',  emoji: '🚗', desc: 'Volume lalu lintas & aksesibilitas' },
  { key: 'income',     label: 'Daya Beli',  color: 'bg-green-500',  emoji: '💰', desc: 'Rata-rata pendapatan area' },
]

const HEATMAP_EXPLANATION = `
Heatmap adalah teknik visualisasi data yang menggunakan warna untuk menunjukkan intensitas nilai:
• Merah/Oranye = Nilai tinggi (bagus untuk bisnis)
• Kuning = Nilai sedang  
• Biru/Hijau muda = Nilai rendah

Dalam konteks RestoMap:
• Population (Kepadatan) - Semakin padat semakin baik untuk bisnis
• Traffic - Semakin tinggi lalu lintas, semakin strategis lokasi
• Income - Semakin tinggi daya beli, semakin potensi revenue
`.trim()

export default function HeatmapToggle({ active, onChange, data, loading }: Props) {
  const [showHelp, setShowHelp] = useState(false)

  const toggle = (layer: Layer) => {
    if (active.includes(layer)) {
      onChange(active.filter((l) => l !== layer))
    } else {
      onChange([layer])
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          Layer heatmap
        </p>
        <button 
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          {showHelp ? 'Tutup' : '📖 Info'}
        </button>
      </div>

      {/* Heatmap explanation */}
      {showHelp && (
        <div className="text-xs bg-gray-50 p-3 rounded-lg mb-3 text-gray-600 leading-relaxed">
          <p className="font-semibold mb-1">Apa itu Heatmap?</p>
          <p className="mb-2">{HEATMAP_EXPLANATION}</p>
          <div className="flex gap-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500 inline-block"></span> Tinggi
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-yellow-500 inline-block"></span> Sedang
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span> Rendah
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {LAYERS.map((l) => {
          const isActive = active.includes(l.key)
          return (
            <button
              key={l.key}
              onClick={() => toggle(l.key)}
              disabled={loading}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 border ${
                isActive
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              } ${loading ? 'opacity-50 cursor-wait' : ''}`}
            >
              <span>{l.emoji}</span>
              <span>{l.label}</span>
              <div className={`w-4 h-1 rounded-full ${isActive ? l.color : 'bg-gray-200'}`} />
            </button>
          )
        })}
      </div>
      
      {/* Status message */}
      {loading && (
        <p className="text-xs text-blue-600 mt-1.5 bg-blue-50 rounded px-2 py-1">
          ⏳ Memuat data dari BPS...
        </p>
      )}
      {!loading && data && active.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-green-600 bg-green-50 rounded px-2 py-1">
            ✅ Data heatmap dari BPS Indonesia berhasil dimuat!
          </p>
          {data.factors && (
            <div className="flex gap-2 text-xs">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                👥 {data.factors.population}
              </span>
              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                🚗 {data.factors.traffic}
              </span>
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                💰 {data.factors.income}
              </span>
            </div>
          )}
        </div>
      )}
      {!loading && !data && active.length > 0 && (
        <p className="text-xs text-amber-600 mt-1.5 bg-amber-50 rounded px-2 py-1">
          ⚠️ Pilih lokasi di peta terlebih dahulu
        </p>
      )}
    </div>
  )
}
