import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import crypto from 'crypto'

// Simple in-memory user store (replace with proper DB in production)
const users = new Map<string, { id: string; email: string; password: string; name: string; role: string }>()
const tokens = new Map<string, { userId: string; email: string }>()

// Mock AuthService without Prisma
class MockAuthService {
  async register(email: string, password: string, name: string, role: string) {
    const existing = Array.from(users.values()).find(u => u.email === email)
    if (existing) throw new Error('USER_EXISTS')
    
    const id = crypto.randomUUID()
    const hashedPassword = Buffer.from(password).toString('base64') // Simple hash for dev
    
    users.set(email, { id, email, password: hashedPassword, name, role })
    return { id, email, name, role }
  }
  
  async login(email: string, password: string) {
    const user = users.get(email)
    if (!user) throw new Error('INVALID_CREDENTIALS')
    
    const hashedPassword = Buffer.from(password).toString('base64')
    if (user.password !== hashedPassword) throw new Error('INVALID_CREDENTIALS')
    
    // Generate simple token
    const token = crypto.randomBytes(32).toString('hex')
    tokens.set(token, { userId: user.id, email: user.email })
    
    return { id: user.id, email: user.email, name: user.name, role: user.role, token }
  }
  
  async verifyToken(token: string) {
    const data = tokens.get(token)
    if (!data) throw new Error('INVALID_TOKEN')
    
    const user = Array.from(users.values()).find(u => u.id === data.userId)
    if (!user) throw new Error('USER_NOT_FOUND')
    
    return { id: user.id, email: user.email, name: user.name, role: user.role }
  }
}

const authService = new MockAuthService()

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
  // Auth is handled in-memory without Prisma

  // POST /auth/register
  app.post('/register', async (request, reply) => {
    try {
      const body = RegisterSchema.parse(request.body)
      const result = await authService.register(body.email, body.password, body.name, body.role)
      return reply.code(201).send({ ok: true, data: result })
    } catch (err: any) {
      if (err.message === 'USER_EXISTS') {
        return reply.code(400).send({ ok: false, error: 'USER_EXISTS' })
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
      const result = await authService.login(body.email, body.password)
      return reply.send({ ok: true, data: result })
    } catch (err: any) {
      if (err.message === 'INVALID_CREDENTIALS') {
        return reply.code(401).send({ ok: false, error: 'INVALID_CREDENTIALS' })
      }
      if (err instanceof z.ZodError) {
        return reply.code(400).send({ ok: false, error: 'VALIDATION_ERROR', details: err.errors })
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
    } catch (err: any) {
      if (err.message === 'INVALID_TOKEN' || err.message === 'USER_NOT_FOUND') {
        return reply.code(401).send({ ok: false, error: err.message })
      }
      throw err
    }
  })
}
