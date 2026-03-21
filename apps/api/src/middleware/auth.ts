import type { FastifyRequest, FastifyReply } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { AuthService } from '../services/AuthService'

const prisma = new PrismaClient()

// ─── Tier limits ─────────────────────────────────────────────────────────────

export const FREE_LIMITS = {
  savedLocations:   3,
  competitorsPerQuery: 5,
  heatmapLayers:    1, // only population
  dailyAnalysis:    10,
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.code(401).send({ ok: false, error: 'MISSING_TOKEN' })
  }
  const token = authHeader.slice(7)
  const authService = new AuthService(
    prisma,
    process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  )
  try {
    const user = await authService.verifyToken(token)
    ;(request as any).user = user
  } catch {
    return reply.code(401).send({ ok: false, error: 'INVALID_TOKEN' })
  }
}

export async function requirePro(request: FastifyRequest, reply: FastifyReply) {
  await requireAuth(request, reply)
  const user = (request as any).user
  if (!user) return // already replied

  if (user.tier !== 'pro') {
    return reply.code(403).send({
      ok: false,
      error: 'PRO_REQUIRED',
      message: 'Fitur ini hanya tersedia untuk pengguna Pro.',
      upgradeUrl: '/upgrade',
    })
  }
}
