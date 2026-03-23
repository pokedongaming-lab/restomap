'use client'

import { useState } from 'react'
import { useLanguage, LanguageToggle } from '@/hooks/useLanguage'

type LocationCriteria = {
  traffic: number       // 0-100
  buyingPower: number   // 0-100
  population: number   // 0-100
  mainRoad: number      // 0-100 (proximity to main road)
  altRoad: number        // 0-100 (alternative routes)
  surrounding: number    // 0-100 (commercial/residential mix)
}

type LocationResult = {
  score: number
  rating: string
  recommendation: string
  matchedCriteria: string[]
}

interface Props {
  onSearch?: (criteria: LocationCriteria) => void
  onBestLocation?: (result: LocationResult) => void
}

const DEFAULT_CRITERIA: LocationCriteria = {
  traffic: 70,
  buyingPower: 70,
  population: 60,
  mainRoad: 80,
  altRoad: 60,
  surrounding: 70,
}

export default function LocationCriteriaSearch({ onSearch, onBestLocation }: Props) {
  const { language, setLanguage, t } = useLanguage()
  const [criteria, setCriteria] = useState<LocationCriteria>(DEFAULT_CRITERIA)
  const [searchResult, setSearchResult] = useState<LocationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const updateCriteria = (key: keyof LocationCriteria, value: number) => {
    setCriteria(prev => ({ ...prev, [key]: value }))
  }

  const findBestLocation = async () => {
    setLoading(true)
    
    // Simulate API call / algorithm
    // In real implementation, this would call the backend with criteria weights
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Calculate weighted score
    const weights = {
      traffic: 0.20,
      buyingPower: 0.25,
      population: 0.15,
      mainRoad: 0.15,
      altRoad: 0.10,
      surrounding: 0.15,
    }

    const score = Math.round(
      criteria.traffic * weights.traffic +
      criteria.buyingPower * weights.buyingPower +
      criteria.population * weights.population +
      criteria.mainRoad * weights.mainRoad +
      criteria.altRoad * weights.altRoad +
      criteria.surrounding * weights.surrounding
    )

    // Determine rating
    let rating: string
    if (score >= 80) rating = language === 'id' ? 'SANGAT BAIK' : 'EXCELLENT'
    else if (score >= 65) rating = language === 'id' ? 'BAIK' : 'GOOD'
    else if (score >= 50) rating = language === 'id' ? 'CUKUP' : 'MODERATE'
    else rating = language === 'id' ? 'RISIKO TINGGI' : 'HIGH RISK'

    // Generate recommendation
    let recommendation: string
    const matchedCriteria: string[] = []
    
    if (criteria.mainRoad >= 80) matchedCriteria.push(language === 'id' ? 'Dekat jalan utama' : 'Near main road')
    if (criteria.buyingPower >= 75) matchedCriteria.push(language === 'id' ? 'Daya beli tinggi' : 'High buying power')
    if (criteria.traffic >= 70) matchedCriteria.push(language === 'id' ? 'Traffic tinggi' : 'High traffic')
    if (criteria.population >= 60) matchedCriteria.push(language === 'id' ? 'Populasi padat' : 'Dense population')
    if (criteria.surrounding >= 70) matchedCriteria.push(language === 'id' ? 'Area komersial baik' : 'Good commercial area')
    
    if (matchedCriteria.length >= 4) {
      recommendation = language === 'id' 
        ? 'Lokasi sangat cocok untuk restoran! Rekomendasi: Fine Dining atau Casual Premium'
        : 'Location highly suitable for restaurant! Recommendation: Fine Dining or Casual Premium'
    } else if (matchedCriteria.length >= 2) {
      recommendation = language === 'id'
        ? 'Lokasi cukup layak. Pertimbangkan untuk jenis restoran yang sesuai dengan kekuatan area.'
        : 'Location fairly suitable. Consider restaurant type that matches area strengths.'
    } else {
      recommendation = language === 'id'
        ? 'Lokasi perlu dipertimbangkan ulang. Mungkin perlu perbaikan akses atau konsep berbeda.'
        : 'Location needs reconsideration. May need improved access or different concept.'
    }

    const result: LocationResult = {
      score,
      rating,
      recommendation,
      matchedCriteria,
    }

    setSearchResult(result)
    onBestLocation?.(result)
    setLoading(false)
  }

  const resetCriteria = () => {
    setCriteria(DEFAULT_CRITERIA)
    setSearchResult(null)
  }

  const criteriaKeys: (keyof LocationCriteria)[] = [
    'traffic', 'buyingPower', 'population', 'mainRoad', 'altRoad', 'surrounding'
  ]

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header with Language Toggle */}
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-lime-400">
            📍 {language === 'id' ? 'KRITERIA LOKASI' : 'LOCATION CRITERIA'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {language === 'id' 
              ? 'Atur kriteria untuk mencari lokasi terbaik' 
              : 'Set criteria to find the best location'}
          </p>
        </div>
        <LanguageToggle />
      </div>

      <div className="p-4 space-y-4">
        {/* Criteria Sliders */}
        {criteriaKeys.map((key) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-gray-400 uppercase tracking-wide">
                {t(`criteria.${key}` as any)}
              </label>
              <span className="text-sm font-mono text-lime-400 font-bold">
                {criteria[key]}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={criteria[key]}
              onChange={(e) => updateCriteria(key, Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-lime-400"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>100</span>
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={findBestLocation}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-lime-400 text-black font-bold text-sm rounded-lg hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {language === 'id' ? 'MENCARI...' : 'SEARCHING...'}
              </span>
            ) : (
              t('btn.findBest')
            )}
          </button>
          <button
            onClick={resetCriteria}
            className="py-3 px-4 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-600 transition-colors"
          >
            {t('btn.reset')}
          </button>
        </div>

        {/* Search Result */}
        {searchResult && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-lime-400/30">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                {language === 'id' ? 'HASIL PENCARIAN' : 'SEARCH RESULT'}
              </div>
              <div className={`px-3 py-1 rounded text-xs font-bold ${
                searchResult.score >= 80 ? 'bg-green-500/20 text-green-400' :
                searchResult.score >= 65 ? 'bg-lime-400/20 text-lime-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {searchResult.score}/100
              </div>
            </div>
            
            <div className="mb-3">
              <div className="text-lg font-bold text-lime-400 mb-1">
                {searchResult.rating}
              </div>
              <p className="text-sm text-gray-300">
                {searchResult.recommendation}
              </p>
            </div>

            {searchResult.matchedCriteria.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-2">
                  {language === 'id' ? 'Kekuatan lokasi:' : 'Location strengths:'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchResult.matchedCriteria.map((item, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 bg-lime-400/10 text-lime-400 text-xs rounded"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Continue to Builder Button */}
            <button
              onClick={() => onSearch?.(criteria)}
              className="w-full mt-4 py-2 bg-lime-400/10 border border-lime-400 text-lime-400 text-sm rounded-lg hover:bg-lime-400 hover:text-black transition-colors"
            >
              {language === 'id' 
                ? 'LANJUT KE RESTOBUILDER →' 
                : 'CONTINUE TO RESTOBUILDER →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}