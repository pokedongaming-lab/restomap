'use client'

import { useState } from 'react'
import type { SavedLocation } from '@/hooks/useSavedLocations'

type Props = {
  locations: SavedLocation[]
  onLoad: (loc: SavedLocation) => void
  onDelete: (id: string) => void
  isAtLimit: boolean
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (days > 0)  return `${days} hari lalu`
  if (hours > 0) return `${hours} jam lalu`
  if (mins > 0)  return `${mins} menit lalu`
  return 'Baru saja'
}

async function exportPDF(loc: SavedLocation) {
  try {
    const res = await fetch('http://localhost:3001/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loc),
    })
    const contentType = res.headers.get('content-type') ?? ''
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    const ext  = contentType.includes('pdf') ? 'pdf' : 'html'
    a.href     = url
    a.download = `RestoMap_${loc.name.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    alert('Gagal export — pastikan API berjalan di localhost:3001')
  }
}

export default function SavedLocationsList({ locations, onLoad, onDelete, isAtLimit }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  if (locations.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200 text-center">
        <p className="text-gray-400 text-xs">Belum ada lokasi tersimpan</p>
        <p className="text-gray-300 text-xs mt-1">Analisa lokasi lalu klik Simpan</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {isAtLimit && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-700">
          🔒 Batas Free: 3 lokasi. Upgrade ke Pro untuk unlimited.
        </div>
      )}

      {locations.map((loc) => (
        <div
          key={loc.id}
          className="bg-white border border-gray-200 rounded-xl p-3 hover:border-indigo-200 transition-all group"
        >
          <div className="flex justify-between items-start gap-2">
            <button
              onClick={() => onLoad(loc)}
              className="flex-1 text-left"
            >
              <p className="text-sm font-medium text-gray-800 line-clamp-1">{loc.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {loc.score !== null && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    loc.score >= 70 ? 'bg-green-100 text-green-700' :
                    loc.score >= 40 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {loc.score}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  r={loc.radius >= 1000 ? `${loc.radius/1000}km` : `${loc.radius}m`}
                </span>
                {loc.category && (
                  <span className="text-xs text-indigo-500">{loc.category}</span>
                )}
                <span className="text-xs text-gray-300">{timeAgo(loc.savedAt)}</span>
              </div>
            </button>

            {/* Delete button */}
            {confirmDelete === loc.id ? (
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => { onDelete(loc.id); setConfirmDelete(null) }}
                  className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg"
                >
                  Hapus
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg"
                >
                  Batal
                </button>
              </div>
            ) : (
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => exportPDF(loc)}
                  className="text-gray-300 hover:text-indigo-500 text-xs px-1"
                  title="Export PDF"
                >
                  📄
                </button>
                <button
                  onClick={() => setConfirmDelete(loc.id)}
                  className="text-gray-300 hover:text-red-400 text-sm px-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
