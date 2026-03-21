'use client'

import { useState, useCallback } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export type HeatmapFactor = 'population' | 'traffic' | 'income'

export type HeatmapData = {
  location: {
    lat: number
    lng: number
    radius: number
  }
  factors: {
    population: number
    income: number
    traffic: number
    competition: number
  }
  source: string
}

export function useHeatmap() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<HeatmapData | null>(null)

  const fetchHeatmapData = useCallback(async (
    lat: number,
    lng: number,
    radius: number
  ) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `${API_URL}/heatmap/factors?lat=${lat}&lng=${lng}&radius=${radius}`
      )
      const json = await res.json()

      if (!json.ok) {
        throw new Error(json.error ?? 'Failed to fetch heatmap data')
      }

      setData(json.data)
      return json.data
    } catch (err: any) {
      setError(err.message)
      console.error('Heatmap fetch error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getFactorColor = useCallback((factor: HeatmapFactor, value: number): string => {
    // Value is 0-100, map to color
    if (value >= 70) return '#16a34a' // green - good
    if (value >= 40) return '#d97706' // yellow - moderate
    return '#dc2626' // red - low
  }, [])

  const getFactorIntensity = useCallback((value: number): number => {
    // Return opacity 0.3 to 1.0 based on value
    return 0.3 + (value / 100) * 0.7
  }, [])

  return {
    loading,
    error,
    data,
    fetchHeatmapData,
    getFactorColor,
    getFactorIntensity,
  }
}
