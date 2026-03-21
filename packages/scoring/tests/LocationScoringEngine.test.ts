import { describe, it, expect, beforeEach } from 'vitest'
import { LocationScoringEngineImpl } from '../src/LocationScoringEngine'
import { InvalidWeightsError, ScoringInput, ScoringWeights } from '../src/types'

// ─── Helpers ────────────────────────────────────────────────────────────────

const VALID_WEIGHTS: ScoringWeights = {
  population: 20,
  traffic:    20,
  income:     20,
  competition:20,
  parking:    10,
  rent:       10,
}

function makeInput(overrides: Partial<ScoringInput> = {}): ScoringInput {
  return {
    lat: -6.2088,
    lng: 106.8456,
    radius: 1000,
    weights: VALID_WEIGHTS,
    ...overrides,
  }
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('LocationScoringEngine', () => {

  let engine: LocationScoringEngineImpl

  beforeEach(() => {
    engine = new LocationScoringEngineImpl()
  })

  // ── Behavior 1 ─────────────────────────────────────────────────────────
  // Valid weights → skor total antara 0–100
  it('returns a total score between 0 and 100 for valid weights', async () => {
    const result = await engine.calculate(makeInput())

    expect(result.total).toBeGreaterThanOrEqual(0)
    expect(result.total).toBeLessThanOrEqual(100)
  })

  // ── Behavior 2 ─────────────────────────────────────────────────────────
  // Weights tidak = 100% → throw InvalidWeightsError
  it('throws InvalidWeightsError when weights do not sum to 100', async () => {
    const badWeights: ScoringWeights = {
      population: 20,
      traffic:    20,
      income:     20,
      competition:20,
      parking:    10,
      rent:       20, // sum = 110
    }

    await expect(
      engine.calculate(makeInput({ weights: badWeights }))
    ).rejects.toThrow(InvalidWeightsError)
  })

  // ── Behavior 3 ─────────────────────────────────────────────────────────
  // Faktor missing → redistribusi bobot, missing_factors terisi
  it('redistributes weights and reports missing factors when a factor has no data', async () => {
    // Simulasi: engine tidak bisa mendapatkan data 'parking' untuk koordinat ini
    engine.simulateMissingFactors(['parking'])

    const result = await engine.calculate(makeInput())

    expect(result.missing_factors).toContain('parking')
    // Total tetap 0–100 meski satu faktor hilang
    expect(result.total).toBeGreaterThanOrEqual(0)
    expect(result.total).toBeLessThanOrEqual(100)
    // Breakdown tidak punya skor untuk faktor yang hilang
    expect(result.breakdown.parking).toBe(0)
  })

  // ── Behavior 4 ─────────────────────────────────────────────────────────
  // Semua faktor nilai max → skor mendekati 100
  it('returns a score close to 100 when all factors are at maximum', async () => {
    engine.simulateFactorValues({
      population:  100,
      traffic:     100,
      income:      100,
      competition: 100,
      parking:     100,
      rent:        100,
    })

    const result = await engine.calculate(makeInput())

    expect(result.total).toBeGreaterThanOrEqual(95)
  })

  // ── Behavior 5 ─────────────────────────────────────────────────────────
  // Semua faktor nilai min → skor mendekati 0
  it('returns a score close to 0 when all factors are at minimum', async () => {
    engine.simulateFactorValues({
      population:  0,
      traffic:     0,
      income:      0,
      competition: 0,
      parking:     0,
      rent:        0,
    })

    const result = await engine.calculate(makeInput())

    expect(result.total).toBeLessThanOrEqual(5)
  })

  // ── Behavior 6 ─────────────────────────────────────────────────────────
  // Skor per faktor sesuai kontribusi bobot masing-masing
  it('calculates each factor score proportional to its weight', async () => {
    // Semua faktor nilai 50 (midpoint), bobot berbeda
    engine.simulateFactorValues({
      population:  50,
      traffic:     50,
      income:      50,
      competition: 50,
      parking:     50,
      rent:        50,
    })

    const heavyWeights: ScoringWeights = {
      population:  40, // bobot besar
      traffic:     40, // bobot besar
      income:      10,
      competition: 5,
      parking:     3,
      rent:        2,
    }

    const result = await engine.calculate(makeInput({ weights: heavyWeights }))

    // population dan traffic harus kontribusi lebih besar dari rent
    expect(result.breakdown.population).toBeGreaterThan(result.breakdown.rent)
    expect(result.breakdown.traffic).toBeGreaterThan(result.breakdown.rent)
    // Total = 50 (semua faktor di midpoint)
    expect(result.total).toBeCloseTo(50, 0)
  })

})
