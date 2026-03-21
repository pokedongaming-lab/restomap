import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Schemas ─────────────────────────────────────────────────────────────────

const SaveLocationSchema = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radius: z.number().min(100).max(5000),
  weights: z.record(z.number()),
  score: z.number().optional(),
})

const UpdateLocationSchema = z.object({
  name: z.string().min(1).optional(),
  weights: z.record(z.number()).optional(),
})

// ─── Routes ─────────────────────────────────────────────────────────────────

export async function savedLocationsRoutes(app: FastifyInstance) {
  const prisma = new PrismaClient()

  // Helper: get user from token
  const getUserId = async (request: any) => {
    try {
      const authHeader = request.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return null
      }
      const token = authHeader.slice(7)
      const decoded = app.jwt.verify(token) as { userId: string }
      return decoded.userId
    } catch {
      return null
    }
  }

  // GET /locations - Get all saved locations for user
  app.get('/locations', async (request, reply) => {
    const userId = await getUserId(request)
    if (!userId) {
      return reply.code(401).send({ ok: false, error: 'UNAUTHORIZED' })
    }

    const locations = await prisma.savedLocation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        city: true,
        lat: true,
        lng: true,
        radius: true,
        weights: true,
        score: true,
        createdAt: true,
      },
    })

    return reply.send({ ok: true, data: locations })
  })

  // POST /locations - Save a new location
  app.post('/locations', async (request, reply) => {
    const userId = await getUserId(request)
    if (!userId) {
      return reply.code(401).send({ ok: false, error: 'UNAUTHORIZED' })
    }

    // Check user's saved locations limit (free tier = 3)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { savedLocations: true },
    })

    if (user?.tier === 'free' && user.savedLocations.length >= 3) {
      return reply.code(403).send({ 
        ok: false, 
        error: 'LIMIT_REACHED',
        message: 'Batas 3 lokasi untuk tier Free. Upgrade ke Pro untuk unlimited.' 
      })
    }

    try {
      const body = SaveLocationSchema.parse(request.body)
      
      const location = await prisma.savedLocation.create({
        data: {
          userId,
          name: body.name,
          city: body.city,
          lat: body.lat,
          lng: body.lng,
          radius: body.radius,
          weights: body.weights,
          score: body.score ?? null,
        },
      })

      return reply.code(201).send({ ok: true, data: location })
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return reply.code(400).send({ ok: false, error: 'VALIDATION_ERROR', details: err.errors })
      }
      app.log.error(err)
      return reply.code(500).send({ ok: false, error: 'INTERNAL_ERROR' })
    }
  })

  // GET /locations/:id - Get single location
  app.get('/locations/:id', async (request, reply) => {
    const userId = await getUserId(request)
    if (!userId) {
      return reply.code(401).send({ ok: false, error: 'UNAUTHORIZED' })
    }

    const { id } = request.params as { id: string }

    const location = await prisma.savedLocation.findFirst({
      where: { id, userId },
    })

    if (!location) {
      return reply.code(404).send({ ok: false, error: 'NOT_FOUND' })
    }

    return reply.send({ ok: true, data: location })
  })

  // PUT /locations/:id - Update location
  app.put('/locations/:id', async (request, reply) => {
    const userId = await getUserId(request)
    if (!userId) {
      return reply.code(401).send({ ok: false, error: 'UNAUTHORIZED' })
    }

    const { id } = request.params as { id: string }

    // Check ownership
    const existing = await prisma.savedLocation.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return reply.code(404).send({ ok: false, error: 'NOT_FOUND' })
    }

    try {
      const body = UpdateLocationSchema.parse(request.body)

      const location = await prisma.savedLocation.update({
        where: { id },
        data: body,
      })

      return reply.send({ ok: true, data: location })
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return reply.code(400).send({ ok: false, error: 'VALIDATION_ERROR', details: err.errors })
      }
      app.log.error(err)
      return reply.code(500).send({ ok: false, error: 'INTERNAL_ERROR' })
    }
  })

  // DELETE /locations/:id - Delete location
  app.delete('/locations/:id', async (request, reply) => {
    const userId = await getUserId(request)
    if (!userId) {
      return reply.code(401).send({ ok: false, error: 'UNAUTHORIZED' })
    }

    const { id } = request.params as { id: string }

    // Check ownership
    const existing = await prisma.savedLocation.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return reply.code(404).send({ ok: false, error: 'NOT_FOUND' })
    }

    await prisma.savedLocation.delete({
      where: { id },
    })

    return reply.send({ ok: true, data: { deleted: true } })
  })
}
