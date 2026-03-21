export type FactorKey =
  | 'population'
  | 'traffic'
  | 'income'
  | 'competition'
  | 'parking'
  | 'rent'

export type ScoringWeights = Record<FactorKey, number>

export type ScoringInput = {
  lat: number
  lng: number
  radius: number
  weights: ScoringWeights
}

export type ScoringResult = {
  total: number
  breakdown: Record<FactorKey, number>
  missing_factors: FactorKey[]
  confidence: 'high' | 'medium' | 'low'
}

export interface LocationScoringEngine {
  calculate(input: ScoringInput): Promise<ScoringResult>
}

export class InvalidWeightsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidWeightsError'
  }
}
