import { useState, useCallback } from 'react'

export type FactorKey = 'population' | 'traffic' | 'income' | 'competition' | 'parking' | 'rent'

export type Weights = Record<FactorKey, number>

export const ALL_FACTORS: FactorKey[] = [
  'population', 'traffic', 'income', 'competition', 'parking', 'rent',
]

export const FACTOR_LABELS: Record<FactorKey, string> = {
  population:  'Kepadatan Penduduk',
  traffic:     'Traffic',
  income:      'Daya Beli',
  competition: 'Kompetitor',
  parking:     'Parkir',
  rent:        'Harga Sewa',
}

export const FACTOR_EMOJIS: Record<FactorKey, string> = {
  population:  '👥',
  traffic:     '🚗',
  income:      '💰',
  competition: '🏪',
  parking:     '🅿️',
  rent:        '🏠',
}

// ─── Presets ─────────────────────────────────────────────────────────────────

export type Preset = { name: string; weights: Weights }

export const DEFAULT_PRESETS: Preset[] = [
  {
    name: 'Kafe Urban',
    weights: { population: 25, traffic: 30, income: 25, competition: 10, parking: 5, rent: 5 },
  },
  {
    name: 'Restoran Keluarga',
    weights: { population: 20, traffic: 15, income: 20, competition: 15, parking: 20, rent: 10 },
  },
  {
    name: 'Fine Dining',
    weights: { population: 10, traffic: 10, income: 40, competition: 20, parking: 10, rent: 10 },
  },
  {
    name: 'Default',
    weights: { population: 20, traffic: 20, income: 20, competition: 20, parking: 10, rent: 10 },
  },
]

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWeights(initial: Weights = DEFAULT_PRESETS[3].weights) {
  const [weights, setWeights] = useState<Weights>(initial)

  // When one factor changes, redistribute the delta proportionally across others
  const setFactor = useCallback((key: FactorKey, newValue: number) => {
    setWeights((prev) => {
      const clamped = Math.max(0, Math.min(100, Math.round(newValue)))
      const delta   = clamped - prev[key]
      if (delta === 0) return prev

      const others = ALL_FACTORS.filter((f) => f !== key)
      const otherSum = others.reduce((s, f) => s + prev[f], 0)

      if (otherSum === 0) return prev

      const next = { ...prev, [key]: clamped }

      // Distribute delta inversely proportional to current values
      let distributed = 0
      others.forEach((f, i) => {
        if (i === others.length - 1) {
          // Last one absorbs rounding error
          next[f] = Math.max(0, prev[f] - (delta - distributed))
        } else {
          const share = Math.round((prev[f] / otherSum) * delta)
          next[f] = Math.max(0, prev[f] - share)
          distributed += share
        }
      })

      // Ensure sum is exactly 100
      const total = ALL_FACTORS.reduce((s, f) => s + next[f], 0)
      if (total !== 100) {
        const diff = 100 - total
        // Add diff to largest factor (other than key)
        const largest = others.reduce((a, b) => next[a] > next[b] ? a : b)
        next[largest] = Math.max(0, next[largest] + diff)
      }

      return next
    })
  }, [])

  const applyPreset = useCallback((preset: Preset) => {
    setWeights(preset.weights)
  }, [])

  const total = ALL_FACTORS.reduce((s, f) => s + weights[f], 0)

  return { weights, setFactor, applyPreset, total }
}
