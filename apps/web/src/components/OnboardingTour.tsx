'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Step = {
  target: string
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
    title: '🔍 Pencarian',
    content: 'Cari lokasi berdasarkan nama kota atau area. Kami akan membawa Anda ke lokasi tersebut.',
  },
  {
    target: 'heatmap-toggle',
    title: '📊 Heatmap',
    content: 'Aktifkan layer heatmap untuk melihat kepadatan penduduk, traffic, dan daya beli.',
  },
  {
    target: 'scoring-panel',
    title: '🎯 Skor Potensi',
    content: 'Lihat skor 0-100 untuk setiap lokasi. Ubah bobot faktor sesuai prioritas bisnis Anda.',
  },
  {
    target: 'competitors-list',
    title: '🏪 Kompetitor',
    content: 'Lihat semua kompetitor dalam radius. Analisa rating, harga, dan gap kategori.',
  },
  {
    target: 'save-button',
    title: '💾 Simpan',
    content: 'Simpan lokasi ke watchlist untuk perbandingan dan export PDF.',
  },
]

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeen, setHasSeen] = useState(true) // Check localStorage
  const router = useRouter()

  useEffect(() => {
    const seen = localStorage.getItem('restomap:onboarding_seen')
    if (!seen) {
      setHasSeen(false)
      setIsOpen(true)
    }
  }, [])

  const startTour = () => {
    setIsOpen(true)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      closeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const closeTour = () => {
    setIsOpen(false)
    localStorage.setItem('restomap:onboarding_seen', 'true')
  }

  const skipTour = () => {
    closeTour()
  }

  // Show tour button if closed
  if (!isOpen && hasSeen) {
    return (
      <button
        onClick={startTour}
        className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg z-50 hover:bg-indigo-700 transition flex items-center gap-2"
      >
        <span>🎯</span>
        <span className="text-sm font-medium">Tour</span>
      </button>
    )
  }

  if (!isOpen) return null

  const step = TOUR_STEPS[currentStep]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
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
  )
}
