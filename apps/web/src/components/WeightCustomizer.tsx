'use client'

import { useState } from 'react'
import {
  ALL_FACTORS,
  FACTOR_LABELS,
  FACTOR_EMOJIS,
  DEFAULT_PRESETS,
  type Weights,
  type Preset,
} from '@/hooks/useWeights'

type Props = {
  weights: Weights
  total: number
  onFactorChange: (key: keyof Weights, value: number) => void
  onPresetApply: (preset: Preset) => void
  getAllPresets: () => Preset[]
  onSavePreset: (name: string) => void
  onDeletePreset?: (name: string) => void
}

export default function WeightCustomizer({ 
  weights, 
  total, 
  onFactorChange, 
  onPresetApply,
  getAllPresets,
  onSavePreset,
  onDeletePreset,
}: Props) {
  const [open, setOpen]             = useState(false)
  const [customName, setCustomName] = useState('')
  const [presets, setPresets]       = useState<Preset[]>(getAllPresets())
  const [activePreset, setActive]   = useState('Default')

  // Refresh presets when they change
  const refreshPresets = () => {
    setPresets(getAllPresets())
  }

  const handlePreset = (preset: Preset) => {
    setActive(preset.name)
    onPresetApply(preset)
  }

  const saveCustomPreset = () => {
    if (!customName.trim()) return
    onSavePreset(customName.trim())
    setActive(customName.trim())
    setCustomName('')
    setOpen(false)
    refreshPresets()
  }

  const handleDeletePreset = (name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDeletePreset) {
      onDeletePreset(name)
      refreshPresets()
    }
  }

  const isValid = Math.abs(total - 100) <= 1
  const defaultPresetNames = DEFAULT_PRESETS.map(p => p.name)

  return (
    <div className="space-y-3">

      {/* Preset chips */}
      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Preset</p>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => handlePreset(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                activePreset === p.name
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.name}
              {!defaultPresetNames.includes(p.name) && onDeletePreset && (
                <span 
                  onClick={(e) => handleDeletePreset(p.name, e)}
                  className="ml-1 text-red-400 hover:text-red-600"
                >
                  ×
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => setOpen(true)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 border border-dashed border-gray-300"
          >
            + Simpan preset
          </button>
        </div>
      </div>

      {/* Save preset input */}
      {open && (
        <div className="flex gap-2">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Nama preset..."
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onKeyDown={(e) => e.key === 'Enter' && saveCustomPreset()}
            autoFocus
          />
          <button
            onClick={saveCustomPreset}
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700"
          >
            Simpan
          </button>
          <button
            onClick={() => setOpen(false)}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200"
          >
            Batal
          </button>
        </div>
      )}

      {/* Sliders */}
      <div className="space-y-3 pt-1">
        {ALL_FACTORS.map((key) => (
          <div key={key}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600 flex items-center gap-1">
                <span>{FACTOR_EMOJIS[key]}</span>
                <span>{FACTOR_LABELS[key]}</span>
              </span>
              <span className="text-xs font-semibold text-indigo-600 w-8 text-right">
                {weights[key]}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={weights[key]}
              onChange={(e) => {
                setActive('Custom')
                onFactorChange(key, Number(e.target.value))
              }}
              className="w-full h-1.5 rounded-full appearance-none bg-gray-200 accent-indigo-600 cursor-pointer"
            />
          </div>
        ))}
      </div>

      {/* Total indicator */}
      <div className={`flex justify-between text-xs rounded-lg px-3 py-2 ${
        isValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
      }`}>
        <span>Total bobot</span>
        <span className="font-semibold">{total}%</span>
      </div>

    </div>
  )
}
