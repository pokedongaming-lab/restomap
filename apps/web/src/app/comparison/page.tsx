'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { SavedLocation } from '@/hooks/useSavedLocations'
import type { FactorKey } from '@/hooks/useWeights'

const FACTOR_LABELS: Record<FactorKey, string> = {
  population:  'Kepadatan Penduduk',
  traffic:     'Traffic',
  income:      'Daya Beli',
  competition: 'Kompetitor',
  parking:     'Parkir',
  rent:        'Harga Sewa',
}

const ALL_FACTORS: FactorKey[] = [
  'population', 'traffic', 'income', 'competition', 'parking', 'rent',
]

const STORAGE_KEY = 'restomap:saved_locations'

function load(): SavedLocation[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') }
  catch { return [] }
}

function ScoreCell({ value, isHigh, isLow }: { value: number; isHigh: boolean; isLow: boolean }) {
  const bg = isHigh ? 'bg-green-50 text-green-700' : isLow ? 'bg-red-50 text-red-500' : 'text-gray-700'
  return (
    <td className={`px-4 py-3 text-center text-sm font-medium ${bg}`}>
      {value.toFixed(1)}
      {isHigh && <span className="ml-1 text-xs">▲</span>}
      {isLow  && <span className="ml-1 text-xs">▼</span>}
    </td>
  )
}

export default function ComparisonPage() {
  const [all, setAll]           = useState<SavedLocation[]>([])
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    setAll(load())
  }, [])

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 3)  return [...prev.slice(1), id] // remove oldest, add new
      return [...prev, id]
    })
  }

  const comparing = all.filter((l) => selected.includes(l.id))

  // For each row, find highest and lowest value across selected locations
  const getMinMax = (key: FactorKey) => {
    const vals = comparing.map((l) => l.score ?? 0)
    // For factor breakdown we use score as proxy since we stored top-level score
    // Full breakdown would require re-fetching — for now use weights × 0.5 as estimate
    return { min: Math.min(...vals), max: Math.max(...vals) }
  }

  const getFactorValue = (loc: SavedLocation, key: FactorKey): number => {
    // Use weight × 0.5 as estimated breakdown (stub data = 50 per factor)
    return (loc.weights[key] / 100) * (loc.score ?? 50) * 2
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link
          href="/map"
          className="text-gray-400 hover:text-gray-600 transition-colors text-sm flex items-center gap-1"
        >
          ← Kembali ke peta
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">R</span>
          </div>
          <span className="font-bold text-gray-800">RestoMap</span>
          <span className="text-gray-300 mx-1">·</span>
          <span className="text-gray-600 text-sm">Perbandingan Lokasi</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* Location selector */}
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Pilih lokasi untuk dibandingkan (max 3)
          </h2>

          {all.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center">
              <p className="text-gray-400">Belum ada lokasi tersimpan.</p>
              <Link href="/map" className="text-indigo-600 text-sm mt-2 block hover:underline">
                Analisa lokasi dulu →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {all.map((loc) => {
                const isSelected = selected.includes(loc.id)
                return (
                  <button
                    key={loc.id}
                    onClick={() => toggle(loc.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{loc.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          r={loc.radius >= 1000 ? `${loc.radius/1000}km` : `${loc.radius}m`}
                          {loc.category && ` · ${loc.category}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        {loc.score !== null && (
                          <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${
                            loc.score >= 70 ? 'bg-green-100 text-green-700' :
                            loc.score >= 40 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {loc.score}
                          </span>
                        )}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Comparison table */}
        {comparing.length >= 2 && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Tabel perbandingan
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-40">
                      Faktor
                    </th>
                    {comparing.map((loc) => (
                      <th key={loc.id} className="px-4 py-3 text-center">
                        <p className="text-sm font-semibold text-gray-800 truncate max-w-[160px] mx-auto">
                          {loc.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {loc.radius >= 1000 ? `${loc.radius/1000}km` : `${loc.radius}m`}
                          {loc.category && ` · ${loc.category}`}
                        </p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Total score row */}
                  <tr className="bg-indigo-50 border-b border-indigo-100">
                    <td className="px-4 py-3 text-sm font-semibold text-indigo-700">
                      🏆 Skor Total
                    </td>
                    {comparing.map((loc) => {
                      const scores = comparing.map((l) => l.score ?? 0)
                      const isHigh = loc.score === Math.max(...scores)
                      const isLow  = loc.score === Math.min(...scores)
                      return (
                        <td key={loc.id} className={`px-4 py-3 text-center`}>
                          <span className={`text-lg font-bold ${
                            isHigh ? 'text-green-600' : isLow ? 'text-red-500' : 'text-indigo-600'
                          }`}>
                            {loc.score ?? '-'}
                          </span>
                          {isHigh && comparing.length > 1 && (
                            <span className="ml-1 text-xs text-green-500">▲ Terbaik</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>

                  {/* Factor rows */}
                  {ALL_FACTORS.map((key, i) => {
                    const vals    = comparing.map((l) => getFactorValue(l, key))
                    const maxVal  = Math.max(...vals)
                    const minVal  = Math.min(...vals)
                    return (
                      <tr key={key} className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {FACTOR_LABELS[key]}
                        </td>
                        {comparing.map((loc) => {
                          const val    = getFactorValue(loc, key)
                          const isHigh = val === maxVal && maxVal !== minVal
                          const isLow  = val === minVal && maxVal !== minVal
                          return (
                            <ScoreCell key={loc.id} value={val} isHigh={isHigh} isLow={isLow} />
                          )
                        })}
                      </tr>
                    )
                  })}

                  {/* Weights row */}
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                      Bobot aktif
                    </td>
                    {comparing.map((loc) => (
                      <td key={loc.id} className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {(Object.entries(loc.weights) as [FactorKey, number][])
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 3)
                            .map(([k, v]) => (
                              <span key={k} className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">
                                {FACTOR_LABELS[k].split(' ')[0]} {v}%
                              </span>
                            ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Recommendation */}
            {comparing.length >= 2 && (() => {
              const best = comparing.reduce((a, b) => (a.score ?? 0) > (b.score ?? 0) ? a : b)
              return (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 mt-4 flex items-start gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      Rekomendasi: {best.name}
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Skor tertinggi {best.score} dari {comparing.length} lokasi yang dibandingkan.
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {comparing.length === 1 && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700 text-center">
            Pilih minimal 2 lokasi untuk mulai membandingkan
          </div>
        )}

        {comparing.length === 0 && all.length > 0 && (
          <div className="bg-gray-100 rounded-xl p-6 text-center text-gray-400 text-sm">
            Pilih lokasi di atas untuk melihat perbandingan
          </div>
        )}

      </div>
    </div>
  )
}
