// ─── Location ────────────────────────────────────────────────────────────────

export type Coordinates = {
  lat: number
  lng: number
}

export type Location = {
  id: string
  name: string
  coordinates: Coordinates
  city: string
  address?: string
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

export type FactorKey =
  | 'population'
  | 'traffic'
  | 'income'
  | 'competition'
  | 'parking'
  | 'rent'

export type ScoringWeights = Record<FactorKey, number>

export type ScoringResult = {
  total: number
  breakdown: Record<FactorKey, number>
  missing_factors: FactorKey[]
  confidence: 'high' | 'medium' | 'low'
}

// ─── Competitor ───────────────────────────────────────────────────────────────

export type CompetitorCategory =
  | 'coffee'
  | 'ramen'
  | 'seafood'
  | 'fastfood'
  | 'indonesian'
  | 'western'
  | 'chinese'
  | 'japanese'
  | 'korean'
  | 'bakery'
  | 'other'

export type Competitor = {
  placeId: string
  name: string
  category: CompetitorCategory
  rating: number
  priceLevel: 1 | 2 | 3 | 4
  distance: number
  coordinates: Coordinates
  isOpen?: boolean
}

// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = 'pengusaha' | 'konsultan' | 'franchise'

export type SubscriptionTier = 'free' | 'pro'

export type User = {
  id: string
  email: string
  name: string
  role: UserRole
  tier: SubscriptionTier
}

// ─── API Response ─────────────────────────────────────────────────────────────

export type ApiSuccess<T> = {
  ok: true
  data: T
}

export type ApiError = {
  ok: false
  error: string
  code?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
