'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import CitySearch from '@/components/CitySearch'
import RadiusSelector from '@/components/RadiusSelector'
import CategoryFilter from '@/components/CategoryFilter'
import HeatmapToggle from '@/components/HeatmapToggle'
import ScoringPanel from '@/components/ScoringPanel'
import SavedLocationsList from '@/components/SavedLocationsList'
import CompetitorList from '@/components/CompetitorList'
import GapCategoryPanel from '@/components/GapCategoryPanel'
import OnboardingTour from '@/components/OnboardingTour'
import { useSavedLocations } from '@/hooks/useSavedLocations'
import { useHeatmap } from '@/hooks/useHeatmap'
import type { MapPin } from '@/components/MapView'
import type { Weights } from '@/hooks/useWeights'

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <p className="text-gray-400 text-sm">Memuat peta...</p>
    </div>
  ),
})

type HeatmapLayer = 'population' | 'traffic' | 'income'
type Tab = 'analisa' | 'kompetitor' | 'tersimpan'

export default function MapPage() {
  const [tab, setTab]               = useState<Tab>('analisa')
  const [radius, setRadius]         = useState(1000)
  const [pin, setPin]               = useState<MapPin | null>(null)
  const [category, setCategory]     = useState<string | null>(null)
  const [heatmapLayers, setHeatmap] = useState<HeatmapLayer[]>([])
  const [saveMsg, setSaveMsg]       = useState<string | null>(null)

  const { locations, save, remove, isAtLimit, loaded } = useSavedLocations()
  const { loading: heatmapLoading, data: heatmapData, fetchHeatmapData } = useHeatmap()

  // Fetch heatmap data when pin changes
  const handleHeatmapChange = useCallback((layers: HeatmapLayer[]) => {
    setHeatmap(layers)
    if (layers.length > 0 && pin) {
      fetchHeatmapData(pin.lat, pin.lng, radius)
    }
  }, [pin, radius, fetchHeatmapData])

  const handleCitySelect = useCallback((lat: number, lng: number, name?: string) => {
    console.log('Flying to:', lat, lng, name)
    // Set the pin first
    setPin({ lat, lng, address: name })
    // Then fly to the location
    window.dispatchEvent(new CustomEvent('restomap:flyto', { detail: { lat, lng } }))
  }, [])

  const handleSave = useCallback(async (score: number, weights: Weights) => {
    if (!pin) return
    const result = await save(pin, radius, weights, category, score)
    if (result.ok) {
      setSaveMsg('✅ Lokasi tersimpan!')
      setTimeout(() => setSaveMsg(null), 2500)
    } else if (result.reason === 'limit_reached') {
      setSaveMsg('🔒 Batas 3 lokasi (Free). Hapus salah satu dulu.')
      setTimeout(() => setSaveMsg(null), 3000)
    }
  }, [pin, radius, category, save])

  const handleLoad = useCallback((loc: typeof locations[0]) => {
    setPin(loc.pin)
    setRadius(loc.radius)
    setCategory(loc.category)
    setTab('analisa')
    window.dispatchEvent(
      new CustomEvent('restomap:flyto', { detail: { lat: loc.pin.lat, lng: loc.pin.lng } })
    )
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      <OnboardingTour />

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-96 flex flex-col bg-white shadow-md z-10">

        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">R</span>
          </div>
          <span className="font-bold text-gray-800 text-lg">RestoMap</span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab('analisa')}
            className={`flex-1 py-2.5 text-sm font-medium transition-all ${tab === 'analisa' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            🔍 Analisa
          </button>
          <button
            onClick={() => setTab('kompetitor')}
            className={`flex-1 py-2.5 text-sm font-medium transition-all ${tab === 'kompetitor' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            🏪 Kompetitor
          </button>
          <button
            onClick={() => setTab('tersimpan')}
            className={`flex-1 py-2.5 text-sm font-medium transition-all ${tab === 'tersimpan' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            🔖 {loaded && locations.length > 0 ? `(${locations.length})` : 'Simpan'}
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {tab === 'analisa' && (
            <>
              {/* Search */}
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                  Cari lokasi
                </p>
                <CitySearch onSelect={handleCitySelect} />
              </div>

              <CategoryFilter value={category} onChange={setCategory} />
              <RadiusSelector value={radius} onChange={setRadius} />
              <HeatmapToggle 
                active={heatmapLayers} 
                onChange={handleHeatmapChange}
                data={heatmapData}
                loading={heatmapLoading}
              />

              <div className="border-t border-gray-100" />

              {/* Pin info */}
              {pin ? (
                <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                  <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">
                    Lokasi dipilih
                  </p>
                  <p className="text-sm text-gray-700 mb-1 line-clamp-2">
                    {pin.address ?? 'Lokasi dipilih'}
                  </p>
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span>📍 {pin.lat.toFixed(5)}</span>
                    <span>{pin.lng.toFixed(5)}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200 text-center">
                  <p className="text-gray-400 text-sm">Klik peta untuk memilih lokasi</p>
                </div>
              )}

              {/* Save message */}
              {saveMsg && (
                <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-xs text-green-700 text-center">
                  {saveMsg}
                </div>
              )}

              {/* Scoring panel */}
              {pin && (
                <ScoringPanel
                  pin={pin}
                  radius={radius}
                  category={category}
                  onSave={handleSave}
                />
              )}
            </>
          )}

          {tab === 'kompetitor' && (
            <>
              {pin ? (
                <>
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                      Filter kategori
                    </p>
                    <CategoryFilter value={category} onChange={setCategory} />
                  </div>
                  <RadiusSelector value={radius} onChange={setRadius} />
                  <div className="border-t border-gray-100" />
                  <CompetitorList
                    lat={pin.lat}
                    lng={pin.lng}
                    radius={radius}
                    category={category}
                  />
                  <div className="border-t border-gray-100 my-4" />
                  <GapCategoryPanel
                    lat={pin.lat}
                    lng={pin.lng}
                    radius={radius}
                  />
                </>
              ) : (
                <div className="bg-gray-50 rounded-xl p-6 border border-dashed border-gray-200 text-center">
                  <p className="text-2xl mb-2">🏪</p>
                  <p className="text-gray-500 text-sm">Klik lokasi di peta dulu</p>
                  <p className="text-gray-300 text-xs mt-1">untuk melihat kompetitor di sekitarnya</p>
                </div>
              )}
            </>
          )}

          {tab === 'tersimpan' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Lokasi tersimpan ({locations.length}/3 Free)
                </p>
                {locations.length >= 2 && (
                  <a href="/comparison" className="text-xs text-indigo-600 hover:underline font-medium">
                    Bandingkan →
                  </a>
                )}
              </div>
              <SavedLocationsList
                locations={locations}
                onLoad={handleLoad}
                onDelete={remove}
                isAtLimit={isAtLimit}
              />
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            RestoMap — Restaurant Location Intelligence
          </p>
        </div>

      </aside>

      {/* ── Map ─────────────────────────────────────────────────────── */}
      <main className="flex-1 relative">
        <MapView onPinChange={setPin} radius={radius} />
      </main>

    </div>
  )
}
