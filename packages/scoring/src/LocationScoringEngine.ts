import {
  FactorKey,
  InvalidWeightsError,
  LocationScoringEngine,
  ScoringInput,
  ScoringResult,
  ScoringWeights,
} from './types'

const ALL_FACTORS: FactorKey[] = [
  'population',
  'traffic',
  'income',
  'competition',
  'parking',
  'rent',
]

const WEIGHT_SUM_TOLERANCE = 0.1

// ─── Engine ─────────────────────────────────────────────────────────────────

export class LocationScoringEngineImpl implements LocationScoringEngine {

  // Test seams: allow tests to inject factor values and missing factors
  // without hitting real data sources. Production code ignores these.
  private _simulatedValues: Partial<Record<FactorKey, number>> | null = null
  private _simulatedMissing: FactorKey[] = []

  simulateFactorValues(values: Partial<Record<FactorKey, number>>): void {
    this._simulatedValues = values
  }

  clearSimulatedValues(): void {
    this._simulatedValues = null
  }

  simulateMissingFactors(factors: FactorKey[]): void {
    this._simulatedMissing = factors
  }

  async calculate(input: ScoringInput): Promise<ScoringResult> {
    this.validateWeights(input.weights)

    const missingFactors = this._simulatedMissing

    // Fetch raw factor scores (0–100 each), skip missing
    const rawScores = await this.fetchFactorScores(input, missingFactors)

    // Redistribute weights across available factors
    const activeFactors = ALL_FACTORS.filter(f => !missingFactors.includes(f))
    const redistributedWeights = this.redistributeWeights(
      input.weights,
      activeFactors,
    )

    // Weighted sum
    const breakdown = {} as Record<FactorKey, number>
    let total = 0

    for (const factor of ALL_FACTORS) {
      if (missingFactors.includes(factor)) {
        breakdown[factor] = 0
        continue
      }
      const contribution = (rawScores[factor]! * redistributedWeights[factor]!) / 100
      breakdown[factor] = Math.round(contribution * 10) / 10
      total += contribution
    }

    return {
      total:           Math.min(100, Math.max(0, Math.round(total * 10) / 10)),
      breakdown,
      missing_factors: missingFactors,
      confidence:      this.deriveConfidence(missingFactors),
    }
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private validateWeights(weights: ScoringWeights): void {
    const sum = Object.values(weights).reduce((a, b) => a + b, 0)
    if (Math.abs(sum - 100) > WEIGHT_SUM_TOLERANCE) {
      throw new InvalidWeightsError(
        `Weights must sum to 100 (got ${sum.toFixed(2)})`
      )
    }
  }

  private async fetchFactorScores(
    input: ScoringInput,
    missingFactors: FactorKey[],
  ): Promise<Partial<Record<FactorKey, number>>> {
    // In production: call data services for each factor.
    // In tests: return simulated values.
    if (this._simulatedValues !== null) {
      return { ...this._simulatedValues }
    }

    // Default stub: return midpoint 50 for all available factors.
    // Replace each stub with a real data service call as those are built.
    const scores: Partial<Record<FactorKey, number>> = {}
    for (const factor of ALL_FACTORS) {
      if (!missingFactors.includes(factor)) {
        scores[factor] = 50
      }
    }
    return scores
  }

  private redistributeWeights(
    weights: ScoringWeights,
    activeFactors: FactorKey[],
  ): Partial<Record<FactorKey, number>> {
    const activeSum = activeFactors.reduce((sum, f) => sum + weights[f], 0)
    if (activeSum === 0) return {}

    const redistributed: Partial<Record<FactorKey, number>> = {}
    for (const factor of activeFactors) {
      redistributed[factor] = (weights[factor] / activeSum) * 100
    }
    return redistributed
  }

  private deriveConfidence(missingFactors: FactorKey[]): 'high' | 'medium' | 'low' {
    if (missingFactors.length === 0) return 'high'
    if (missingFactors.length <= 2)  return 'medium'
    return 'low'
  }
}
