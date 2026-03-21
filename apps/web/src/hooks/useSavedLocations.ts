'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Weights } from './useWeights'
import type { MapPin } from '@/components/MapView'

export type SavedLocation = {
  id: string
  name: string
  pin: MapPin
  radius: number
  weights: Weights
  category: string | null
  score: number | null
  savedAt: string
}

const STORAGE_KEY = 'restomap:saved_locations'
const FREE_LIMIT  = 3

function load(): SavedLocation[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function persist(locations: SavedLocation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locations))
}

export function useSavedLocations() {
  const [locations, setLocations] = useState<SavedLocation[]>([])
  const [loaded, setLoaded]       = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setLocations(load())
    setLoaded(true)
  }, [])

  const save = useCallback((
    pin: MapPin,
    radius: number,
    weights: Weights,
    category: string | null,
    score: number | null,
    name?: string,
  ): { ok: boolean; reason?: 'limit_reached' } => {
    const current = load()

    if (current.length >= FREE_LIMIT) {
      return { ok: false, reason: 'limit_reached' }
    }

    const defaultName = pin.address
      ? pin.address.split(',')[0].trim()
      : `Lokasi ${current.length + 1}`

    const entry: SavedLocation = {
      id:       crypto.randomUUID(),
      name:     name ?? defaultName,
      pin,
      radius,
      weights,
      category,
      score,
      savedAt:  new Date().toISOString(),
    }

    const updated = [entry, ...current]
    persist(updated)
    setLocations(updated)
    return { ok: true }
  }, [])

  const remove = useCallback((id: string) => {
    const updated = load().filter((l) => l.id !== id)
    persist(updated)
    setLocations(updated)
  }, [])

  const isAtLimit = locations.length >= FREE_LIMIT

  return { locations, save, remove, isAtLimit, loaded }
}
