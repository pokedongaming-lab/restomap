import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { AuthService, AuthError } from '../services/AuthService'

const prisma = new PrismaClient()

const RegisterSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
  name:     z.string().min(2),
  role:     z.enum(['pengusaha', 'konsultan', 'franchise']),
})

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string(),
})

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService(
    prisma,
    process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  )

  // POST /auth/register
  app.post('/register', async (request, reply) => {
    try {
      const body = RegisterSchema.parse(request.body)
      const result = await authService.register(body)
      return reply.code(201).send({ ok: true, data: result })
    } catch (err) {
      if (err instanceof AuthError) {
        return reply.code(err.statusCode).send({ ok: false, error: err.code })
      }
      if (err instanceof z.ZodError) {
        return reply.code(400).send({ ok: false, error: 'VALIDATION_ERROR', details: err.errors })
      }
      throw err
    }
  })

  // POST /auth/login
  app.post('/login', async (request, reply) => {
    try {
      const body = LoginSchema.parse(request.body)
      const result = await authService.login(body)
      return reply.send({ ok: true, data: result })
    } catch (err) {
      if (err instanceof AuthError) {
        return reply.code(err.statusCode).send({ ok: false, error: err.code })
      }
      throw err
    }
  })

  // GET /auth/me
  app.get('/me', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.code(401).send({ ok: false, error: 'MISSING_TOKEN' })
      }
      const token = authHeader.slice(7)
      const user = await authService.verifyToken(token)
      return reply.send({ ok: true, data: { user } })
    } catch (err) {
      if (err instanceof AuthError) {
        return reply.code(err.statusCode).send({ ok: false, error: err.code })
      }
      throw err
    }
  })
}
