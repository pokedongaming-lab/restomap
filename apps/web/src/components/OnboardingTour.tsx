'use client'

import { useState, useEffect, useRef } from 'react'

type Step = {
  target: string
  targetTab?: 'analisa' | 'kompetitor' | 'tersimpan'
  title: string
  content: string
}

const TOUR_STEPS: Step[] = [
  {
    target: 'map-container',
    title: '🗺️ Peta Interaktif',
    content: 'Klik di mana saja di peta untuk memilih lokasi. Geser dan zoom untuk mengeksplorasi area.',
  },
  {
    target: 'search-box',
    targetTab: 'analisa',
    title: '🔍 Pencarian',
    content: 'Cari lokasi berdasarkan nama kota atau area.',
  },
  {
    target: 'heatmap-toggle',
    targetTab: 'analisa',
    title: '📊 Heatmap',
    content: 'Aktifkan layer heatmap untuk melihat kepadatan penduduk, traffic, dan daya beli.',
  },
  {
    target: 'scoring-panel',
    targetTab: 'analisa',
    title: '🎯 Skor Potensi',
    content: 'Lihat skor 0-100 untuk setiap lokasi.',
  },
  {
    target: 'competitors-list',
    targetTab: 'kompetitor',
    title: '🏪 Kompetitor',
    content: 'Lihat semua kompetitor dalam radius.',
  },
  {
    target: 'save-button',
    targetTab: 'analisa',
    title: '💾 Simpan',
    content: 'Simpan lokasi ke watchlist.',
  },
]

// Element IDs for each step
const TARGET_IDS: Record<string, string> = {
  'map-container': 'map-container',
  'search-box': 'search-box',
  'heatmap-toggle': 'heatmap-toggle',
  'scoring-panel': 'scoring-panel',
  'competitors-list': 'competitors-list',
  'save-button': 'save-button',
}

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const highlightedRef = useRef<string | null>(null)

  useEffect(() => {
    const seen = localStorage.getItem('restomap:onboarding_seen')
    if (!seen) {
      // Delay slightly to ensure page is loaded
      setTimeout(() => setIsOpen(true), 500)
    }
  }, [])

  // Handle step change - scroll to element and highlight
  useEffect(() => {
    if (!isOpen) return

    const step = TOUR_STEPS[currentStep]
    const targetId = TARGET_IDS[step.target]
    
    if (!targetId) return

    // Remove previous highlight
    if (highlightedRef.current) {
      const prevEl = document.getElementById(highlightedRef.current)
      if (prevEl) {
        prevEl.style.outline = ''
        prevEl.style.transition = ''
      }
    }

    // Small delay to ensure element exists
    setTimeout(() => {
      const el = document.getElementById(targetId)
      if (el) {
        // Scroll into view
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        
        // Add highlight
        el.style.outline = '3px solid #4F46E5'
        el.style.outlineOffset = '4px'
        el.style.transition = 'all 0.3s ease'
        
        highlightedRef.current = targetId
      }
    }, 100)

  }, [currentStep, isOpen])

  // Cleanup on close
  useEffect(() => {
    if (!isOpen && highlightedRef.current) {
      const el = document.getElementById(highlightedRef.current)
      if (el) {
        el.style.outline = ''
        el.style.transition = ''
      }
      highlightedRef.current = null
    }
  }, [isOpen])

  const startTour = () => {
    setIsOpen(true)
    setCurrentStep(0)
  }

  const nextStep = () => {
    // Remove highlight before moving
    if (highlightedRef.current) {
      const el = document.getElementById(highlightedRef.current)
      if (el) {
        el.style.outline = ''
        el.style.transition = ''
      }
      highlightedRef.current = null
    }

    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsOpen(false)
      localStorage.setItem('restomap:onboarding_seen', 'true')
    }
  }

  const prevStep = () => {
    // Remove highlight before moving
    if (highlightedRef.current) {
      const el = document.getElementById(highlightedRef.current)
      if (el) {
        el.style.outline = ''
        el.style.transition = ''
      }
      highlightedRef.current = null
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTour = () => {
    // Remove highlight
    if (highlightedRef.current) {
      const el = document.getElementById(highlightedRef.current)
      if (el) {
        el.style.outline = ''
        el.style.transition = ''
      }
    }
    setIsOpen(false)
    localStorage.setItem('restomap:onboarding_seen', 'true')
  }

  // Tour button
  const TourButton = () => (
    <button
      onClick={startTour}
      className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg z-50 hover:bg-indigo-700 transition flex items-center gap-2"
    >
      <span>🎯</span>
      <span className="text-sm font-medium">Tour</span>
    </button>
  )

  if (!isOpen) {
    return <TourButton />
  }

  const step = TOUR_STEPS[currentStep]

  return (
    <>
      <TourButton />
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          {/* Progress */}
          <div className="flex gap-2 mb-4">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition ${
                  i <= currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h2>
            <p className="text-gray-600">{step.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={skipTour}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Lewati
            </button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  ←
                </button>
              )}
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Selesai' : 'Lanjut →'}
              </button>
            </div>
          </div>

          {/* Step counter */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Step {currentStep + 1} dari {TOUR_STEPS.length}
          </p>
        </div>
      </div>
    </>
  )
}
