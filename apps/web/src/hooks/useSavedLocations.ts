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
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const FREE_LIMIT = 3

function loadFromStorage(): SavedLocation[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function persistToStorage(locations: SavedLocation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locations))
}

// API functions
async function fetchLocations(token: string): Promise<SavedLocation[]> {
  const res = await fetch(`${API_URL}/locations`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch locations')
  const data = await res.json()
  return data.data.map((loc: any) => ({
    id: loc.id,
    name: loc.name,
    pin: { lat: loc.lat, lng: loc.lng, address: loc.city },
    radius: loc.radius,
    weights: loc.weights as Weights,
    category: null,
    score: loc.score,
    savedAt: loc.createdAt,
  }))
}

async function saveToApi(
  token: string,
  location: Omit<SavedLocation, 'id' | 'savedAt'>
): Promise<SavedLocation> {
  const res = await fetch(`${API_URL}/locations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: location.name,
      city: location.pin.address ?? 'Unknown',
      lat: location.pin.lat,
      lng: location.pin.lng,
      radius: location.radius,
      weights: location.weights,
      score: location.score,
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    if (err.error === 'LIMIT_REACHED') {
      throw new Error('LIMIT_REACHED')
    }
    throw new Error('Failed to save location')
  }
  const data = await res.json()
  return {
    ...location,
    id: data.data.id,
    savedAt: data.data.createdAt,
  }
}

async function deleteFromApi(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/locations/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to delete location')
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('restomap:auth_token')
}

export function useSavedLocations() {
  const [locations, setLocations] = useState<SavedLocation[]>([])
  const [loaded, setLoaded] = useState(false)
  const [isOnline, setIsOnline] = useState(false)

  // Load locations on mount
  useEffect(() => {
    const token = getToken()
    if (token) {
      setIsOnline(true)
      fetchLocations(token)
        .then(setLocations)
        .catch(() => {
          // Fallback to localStorage if API fails
          setLocations(loadFromStorage())
        })
        .finally(() => setLoaded(true))
    } else {
      setLocations(loadFromStorage())
      setLoaded(true)
    }
  }, [])

  const save = useCallback(
    async (
      pin: MapPin,
      radius: number,
      weights: Weights,
      category: string | null,
      score: number | null,
      name?: string
    ): Promise<{ ok: boolean; reason?: 'limit_reached' }> => {
      const token = getToken()
      const defaultName = pin.address
        ? pin.address.split(',')[0].trim()
        : `Lokasi ${locations.length + 1}`

      const location = {
        name: name ?? defaultName,
        pin,
        radius,
        weights,
        category,
        score,
      }

      // If logged in, use API
      if (token) {
        try {
          const saved = await saveToApi(token, location)
          setLocations((prev) => [saved, ...prev])
          return { ok: true }
        } catch (err: any) {
          if (err.message === 'LIMIT_REACHED') {
            return { ok: false, reason: 'limit_reached' }
          }
          // Fallback to localStorage on error
        }
      }

      // Fallback to localStorage
      const current = loadFromStorage()
      if (current.length >= FREE_LIMIT) {
        return { ok: false, reason: 'limit_reached' }
      }

      const entry: SavedLocation = {
        ...location,
        id: crypto.randomUUID(),
        savedAt: new Date().toISOString(),
      }

      const updated = [entry, ...current]
      persistToStorage(updated)
      setLocations(updated)
      return { ok: true }
    },
    [locations.length]
  )

  const remove = useCallback(async (id: string) => {
    const token = getToken()

    // If logged in, use API
    if (token) {
      try {
        await deleteFromApi(token, id)
      } catch {
        // Fallback to localStorage on error
      }
    }

    // Always remove from local state
    const updated = loadFromStorage().filter((l) => l.id !== id)
    persistToStorage(updated)
    setLocations(updated)
  }, [])

  const isAtLimit = locations.length >= FREE_LIMIT

  return { locations, save, remove, isAtLimit, loaded, isOnline }
}
