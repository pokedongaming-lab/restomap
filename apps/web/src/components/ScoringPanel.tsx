'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import WeightCustomizer from './WeightCustomizer'
import { useWeights, type Weights, type FactorKey, type Preset, FACTOR_LABELS } from '@/hooks/useWeights'
import type { MapPin } from './MapView'

type ScoringResult = {
  total: number
  breakdown: Record<FactorKey, number>
  missing_factors: FactorKey[]
  confidence: 'high' | 'medium' | 'low'
}

type Props = {
  pin: MapPin
  radius: number
  category: string | null
  onSave?: (score: number, weights: Weights) => void
}

function ScoreBar({ value }: { value: number }) {
  const color = value >= 70 ? 'bg-green-500' : value >= 40 ? 'bg-amber-500' : 'bg-red-400'
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div
        className={`${color} h-1.5 rounded-full transition-all duration-500`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function ScoreCircle({ score, loading }: { score: number; loading: boolean }) {
  const color = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-500' : 'text-red-500'
  const bg    = score >= 70 ? 'bg-green-50'   : score >= 40 ? 'bg-amber-50'   : 'bg-red-50'
  return (
    <div className={`${bg} rounded-2xl p-4 flex flex-col items-center transition-all`}>
      {loading ? (
        <div className="animate-pulse text-gray-300 text-4xl font-bold">--</div>
      ) : (
        <span className={`${color} text-4xl font-bold transition-all duration-300`}>{score}</span>
      )}
      <span className="text-gray-500 text-xs mt-1">Skor Potensi</span>
    </div>
  )
}

export default function ScoringPanel({ pin, radius, category, onSave }: Props) {
  const { weights, setFactor, applyPreset, total, getAllPresets, saveAsPreset, deletePreset } = useWeights()
  const [result, setResult]   = useState<ScoringResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [showWeights, setShowWeights] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasAnalyzed = useRef(false)

  const analyze = useCallback(async (w: Weights) => {
    if (Math.abs(Object.values(w).reduce((s, v) => s + v, 0) - 100) > 1) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:3001/scoring/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: pin.lat, lng: pin.lng, radius, weights: w }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error)
      setResult(json.data)
    } catch (e: any) {
      setError(e.message ?? 'Gagal menghubungi API')
    } finally {
      setLoading(false)
    }
  }, [pin, radius])

  // Debounce re-analysis when weights change (only after first analysis)
  useEffect(() => {
    if (!hasAnalyzed.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => analyze(weights), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [weights, analyze])

  const handleAnalyze = () => {
    hasAnalyzed.current = true
    analyze(weights)
  }

  const handlePreset = (preset: Preset) => {
    applyPreset(preset)
    if (hasAnalyzed.current) analyze(preset.weights)
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-4 text-sm text-red-600 border border-red-100">
        ⚠️ {error}
        <button onClick={handleAnalyze} className="block mt-2 text-indigo-600 underline text-xs">
          Coba lagi
        </button>
      </div>
    )
  }

  if (!result && !loading) {
    return (
      <div className="space-y-3">
        {/* Weight customizer — collapsed by default */}
        <button
          onClick={() => setShowWeights((v) => !v)}
          className="w-full flex justify-between items-center text-xs text-gray-500 hover:text-gray-700 py-1"
        >
          <span>⚙️ Kustomisasi bobot faktor</span>
          <span>{showWeights ? '▲' : '▼'}</span>
        </button>
        {showWeights && (
          <WeightCustomizer
            weights={weights}
            total={total}
            onFactorChange={setFactor}
            onPresetApply={handlePreset}
            getAllPresets={getAllPresets}
            onSavePreset={saveAsPreset}
            onDeletePreset={deletePreset}
          />
        )}
        <button
          onClick={handleAnalyze}
          className="w-full py-3 rounded-xl font-medium text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
        >
          🔍 Analisa Lokasi
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <ScoreCircle score={result?.total ?? 0} loading={loading} />

      {/* Weight customizer — collapsed by default */}
      <button
        onClick={() => setShowWeights((v) => !v)}
        className="w-full flex justify-between items-center text-xs text-gray-500 hover:text-gray-700 py-1"
      >
        <span>⚙️ Kustomisasi bobot · skor update otomatis</span>
        <span>{showWeights ? '▲' : '▼'}</span>
      </button>
      {showWeights && (
        <WeightCustomizer
          weights={weights}
          total={total}
          onFactorChange={setFactor}
          onPresetApply={handlePreset}
        />
      )}

      {/* Breakdown */}
      {result && (
        <div className="space-y-2 pt-1">
          {(Object.keys(FACTOR_LABELS) as FactorKey[]).map((key) => (
            <div key={key}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{FACTOR_LABELS[key]}</span>
                <span className="font-medium">{result.breakdown[key].toFixed(1)}</span>
              </div>
              <ScoreBar value={result.breakdown[key]} />
            </div>
          ))}
        </div>
      )}

      {result?.confidence !== 'high' && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          ⚠️ Confidence: {result?.confidence} — beberapa data tidak tersedia
        </p>
      )}

      {result && onSave && (
        <button
          onClick={() => onSave(result.total, weights)}
          className="w-full py-2.5 rounded-xl text-sm font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all border border-indigo-100"
        >
          🔖 Simpan Lokasi
        </button>
      )}

      <button
        onClick={() => { setResult(null); hasAnalyzed.current = false }}
        className="w-full py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition-all"
      >
        Reset analisa
      </button>
    </div>
  )
}
