import { describe, it, expect } from 'vitest'
import { buildReportHtml, type SavedLocation } from '../src/services/ReportGenerator'

// ─── Test Data ─────────────────────────────────────────────────────────────

const MOCK_LOCATION: SavedLocation = {
  id: 'loc_123',
  name: 'Kedai Kopi Nusantara',
  pin: {
    lat: -6.2088,
    lng: 106.8456,
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
  },
  radius: 1000,
  weights: {
    population: 25,
    traffic: 20,
    income: 20,
    competition: 15,
    parking: 10,
    rent: 10,
  },
  category: 'coffee',
  score: 78,
  savedAt: '2026-03-15T10:30:00Z',
}

const HIGH_SCORE_LOCATION: SavedLocation = {
  ...MOCK_LOCATION,
  score: 85,
}

const LOW_SCORE_LOCATION: SavedLocation = {
  ...MOCK_LOCATION,
  score: 32,
}

const LOCATION_WITHOUT_OPTIONAL: SavedLocation = {
  id: 'loc_456',
  name: 'Cafe Minimalis',
  pin: {
    lat: -6.1751,
    lng: 106.8650,
    // address undefined
  },
  radius: 500,
  weights: {
    population: 30,
    traffic: 25,
    income: 25,
    competition: 10,
    parking: 5,
    rent: 5,
  },
  category: null,
  score: null, // no score
  savedAt: '2026-03-18T14:00:00Z',
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('ReportGenerator', () => {

  // ── Behavior 1 ─────────────────────────────────────────────────────────
  it('generates HTML with correct location name', () => {
    const html = buildReportHtml(MOCK_LOCATION, '15 Mar 2026')

    expect(html).toContain('Kedai Kopi Nusantara')
  })

  // ── Behavior 2 ─────────────────────────────────────────────────────────
  it('generates HTML with correct address', () => {
    const html = buildReportHtml(MOCK_LOCATION, '15 Mar 2026')

    expect(html).toContain('Jl. Sudirman No. 123, Jakarta Pusat')
  })

  // ── Behavior 3 ─────────────────────────────────────────────────────────
  it('displays score when available', () => {
    const html = buildReportHtml(MOCK_LOCATION, '15 Mar 2026')

    expect(html).toContain('78')
    expect(html).toContain('Skor Potensi')
  })

  // ── Behavior 4 ─────────────────────────────────────────────────────────
  it('shows green score color when score >= 70', () => {
    const html = buildReportHtml(HIGH_SCORE_LOCATION, '15 Mar 2026')

    expect(html).toContain('#16a34a') // green
  })

  // ── Behavior 5 ─────────────────────────────────────────────────────────
  it('shows yellow score color when score 40-69', () => {
    const html = buildReportHtml(MOCK_LOCATION, '15 Mar 2026')

    expect(html).toContain('#d97706') // yellow/orange
  })

  // ── Behavior 6 ─────────────────────────────────────────────────────────
  it('shows red score color when score < 40', () => {
    const html = buildReportHtml(LOW_SCORE_LOCATION, '15 Mar 2026')

    expect(html).toContain('#dc2626') // red
  })

  // ── Behavior 7 ─────────────────────────────────────────────────────────
  it('handles missing score gracefully', () => {
    const html = buildReportHtml(LOCATION_WITHOUT_OPTIONAL, '18 Mar 2026')

    expect(html).toContain('> - <') // score shows as dash
  })

  // ── Behavior 8 ─────────────────────────────────────────────────────────
  it('handles missing address gracefully', () => {
    const html = buildReportHtml(LOCATION_WITHOUT_OPTIONAL, '18 Mar 2026')

    // Should fallback to coordinates
    expect(html).toContain('-6.17510')
    expect(html).toContain('106.86500')
  })

  // ── Behavior 9 ─────────────────────────────────────────────────────────
  it('includes all factor weights in breakdown', () => {
    const html = buildReportHtml(MOCK_LOCATION, '15 Mar 2026')

    expect(html).toContain('Kepadatan Penduduk')
    expect(html).toContain('Traffic')
    expect(html).toContain('Daya Beli')
    expect(html).toContain('Kompetitor')
    expect(html).toContain('Parkir')
    expect(html).toContain('Harga Sewa')
  })

  // ── Behavior 10 ─────────────────────────────────────────────────────────
  it('displays category when available', () => {
    const html = buildReportHtml(MOCK_LOCATION, '15 Mar 2026')

    expect(html).toContain('coffee')
  })

  // ── Behavior 11 ─────────────────────────────────────────────────────────
  it('displays radius in correct format (km)', () => {
    const html = buildReportHtml(MOCK_LOCATION, '15 Mar 2026')

    expect(html).toContain('1km')
  })

  // ── Behavior 12 ─────────────────────────────────────────────────────────
  it('displays radius in correct format (m) for small radius', () => {
    const html = buildReportHtml(LOCATION_WITHOUT_OPTIONAL, '18 Mar 2026')

    expect(html).toContain('500m')
  })

  // ── Behavior 13 ─────────────────────────────────────────────────────────
  it('includes disclaimer text', () => {
    const html = buildReportHtml(MOCK_LOCATION, '15 Mar 2026')

    expect(html).toContain('estimasi')
    expect(html).toContain('due diligence')
  })

  // ── Behavior 14 ─────────────────────────────────────────────────────────
  it('includes generated timestamp', () => {
    const html = buildReportHtml(MOCK_LOCATION, '15 Mar 2026')

    expect(html).toContain('15 Mar 2026')
  })

  // ── Behavior 15 ─────────────────────────────────────────────────────────
  it('includes RestoMap branding', () => {
    const html = buildReportHtml(MOCK_LOCATION, '15 Mar 2026')

    expect(html).toContain('RestoMap')
    expect(html).toContain('restomap.id')
  })
})
