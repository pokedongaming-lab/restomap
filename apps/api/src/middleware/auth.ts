import type { FastifyRequest, FastifyReply } from 'fastify'

// ─── Tier limits ─────────────────────────────────────────────────────────────

export const FREE_LIMITS = {
  savedLocations:   3,
  competitorsPerQuery: 5,
  heatmapLayers:    1, // only population
  dailyAnalysis:    10,
}

// Simple token validation (in production, use proper JWT with user lookup)
const validTokens = new Map<string, { userId: string; email: string; role: string }>()

export function registerToken(token: string, userData: { userId: string; email: string; role: string }) {
  validTokens.set(token, userData)
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.code(401).send({ ok: false, error: 'MISSING_TOKEN' })
  }
  const token = authHeader.slice(7)
  const user = validTokens.get(token)
  
  if (!user) {
    return reply.code(401).send({ ok: false, error: 'INVALID_TOKEN' })
  }
  
  ;(request as any).user = user
}

export async function requirePro(request: FastifyRequest, reply: FastifyReply) {
  await requireAuth(request, reply)
  const user = (request as any).user
  if (!user) return // already replied
  
  if (user.role !== 'pro' && user.role !== 'enterprise') {
    return reply.code(403).send({ ok: false, error: 'PRO_REQUIRED' })
  }
}
