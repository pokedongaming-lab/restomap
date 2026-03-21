import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CompetitorService, type CompetitorQuery } from '../src/services/CompetitorService'

// ─── Mock Google Maps Client ─────────────────────────────────────────────────

const mockPlacesNearby = vi.fn()

vi.mock('@googlemaps/google-maps-services-js', () => ({
  Client: vi.fn().mockImplementation(() => ({
    placesNearby: mockPlacesNearby,
  })),
}))

// ─── Test Data ─────────────────────────────────────────────────────────────

const VALID_QUERY: CompetitorQuery = {
  lat: -6.2088,
  lng: 106.8456,
  radius: 1000,
  category: 'coffee',
  maxResults: 10,
}

const MOCK_API_RESPONSE = {
  status: 'OK',
  results: [
    {
      place_id: 'place_1',
      name: 'Kopi Kenangan',
      types: ['cafe', 'food'],
      rating: 4.5,
      price_level: 2,
      vicinity: 'Jl. Sudirman No.1, Jakarta',
      geometry: { location: { lat: -6.2090, lng: 106.8460 } },
      opening_hours: { open_now: true },
      photos: [{ photo_reference: 'photo_1' }],
    },
    {
      place_id: 'place_2',
      name: 'Starbucks Reserve',
      types: ['cafe', 'coffee_shop'],
      rating: 4.8,
      price_level: 3,
      vicinity: 'Jl. Thamrin No.5, Jakarta',
      geometry: { location: { lat: -6.2100, lng: 106.8470 } },
      opening_hours: { open_now: true },
      photos: [{ photo_reference: 'photo_2' }],
    },
    {
      place_id: 'place_3',
      name: 'Titik Temu Coffee',
      types: ['cafe'],
      rating: 4.2,
      price_level: null,
      vicinity: 'Jl. Gatot Subroto, Jakarta',
      geometry: { location: { lat: -6.2110, lng: 106.8480 } },
      opening_hours: { open_now: false },
      photos: [],
    },
  ],
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CompetitorService', () => {
  let service: CompetitorService

  beforeEach(() => {
    service = new CompetitorService('fake-api-key')
    vi.clearAllMocks()
  })

  // ── Behavior 1 ─────────────────────────────────────────────────────────────
  it('returns list of competitors when API returns OK status', async () => {
    mockPlacesNearby.mockResolvedValueOnce({ data: MOCK_API_RESPONSE })

    const result = await service.findNearby(VALID_QUERY)

    expect(result).toHaveLength(3)
    expect(result[0].name).toBe('Kopi Kenangan')
    expect(result[0].placeId).toBe('place_1')
    expect(result[0].rating).toBe(4.5)
    expect(result[0].isOpen).toBe(true)
  })

  // ── Behavior 2 ─────────────────────────────────────────────────────────────
  it('sorts competitors by distance (nearest first)', async () => {
    mockPlacesNearby.mockResolvedValueOnce({ data: MOCK_API_RESPONSE })

    const result = await service.findNearby(VALID_QUERY)

    // Results should be sorted by distance
    expect(result[0].distance).toBeLessThanOrEqual(result[1].distance)
    expect(result[1].distance).toBeLessThanOrEqual(result[2].distance)
  })

  // ── Behavior 3 ─────────────────────────────────────────────────────────────
  it('limits results to maxResults when specified', async () => {
    mockPlacesNearby.mockResolvedValueOnce({ data: MOCK_API_RESPONSE })

    const result = await service.findNearby({ ...VALID_QUERY, maxResults: 2 })

    expect(result).toHaveLength(2)
  })

  // ── Behavior 4 ─────────────────────────────────────────────────────────────
  it('returns empty array when ZERO_RESULTS', async () => {
    mockPlacesNearby.mockResolvedValueOnce({
      data: { status: 'ZERO_RESULTS', results: [] },
    })

    const result = await service.findNearby(VALID_QUERY)

    expect(result).toHaveLength(0)
  })

  // ── Behavior 5 ─────────────────────────────────────────────────────────────
  it('throws Error when API returns error status', async () => {
    mockPlacesNearby.mockResolvedValueOnce({
      data: { status: 'REQUEST_DENIED', results: [] },
    })

    await expect(service.findNearby(VALID_QUERY)).rejects.toThrow(
      'Places API error: REQUEST_DENIED'
    )
  })

  // ── Behavior 6 ─────────────────────────────────────────────────────────────
  it('calculates distance correctly using haversine', async () => {
    mockPlacesNearby.mockResolvedValueOnce({ data: MOCK_API_RESPONSE })

    const result = await service.findNearby(VALID_QUERY)

    // Distance should be calculated and positive
    expect(result[0].distance).toBeGreaterThan(0)
    expect(typeof result[0].distance).toBe('number')
  })

  // ── Behavior 7 ─────────────────────────────────────────────────────────────
  it('uses custom category when provided', async () => {
    mockPlacesNearby.mockResolvedValueOnce({ data: MOCK_API_RESPONSE })

    await service.findNearby({ ...VALID_QUERY, category: 'ramen' })

    // Verify API was called with correct type
    expect(mockPlacesNearby).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          type: 'restaurant', // ramen maps to restaurant
          keyword: 'ramen',
        }),
      })
    )
  })

  // ── Behavior 8 ─────────────────────────────────────────────────────────────
  it('handles missing optional fields gracefully', async () => {
    mockPlacesNearby.mockResolvedValueOnce({
      data: {
        status: 'OK',
        results: [
          {
            place_id: 'place_no_optional',
            name: 'Minimal Cafe',
            types: ['cafe'],
            // rating, price_level, opening_hours, photos all missing
          },
        ],
      },
    })

    const result = await service.findNearby(VALID_QUERY)

    expect(result[0].rating).toBeNull()
    expect(result[0].priceLevel).toBeNull()
    expect(result[0].isOpen).toBeNull()
    expect(result[0].photoRef).toBeNull()
  })
})
