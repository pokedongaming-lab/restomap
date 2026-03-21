import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AuthService } from '../src/services/AuthService'

// ─── Mock Prisma ─────────────────────────────────────────────────────────────
// We test AuthService behavior through its public interface.
// Prisma is an I/O dependency — we stub it so tests stay fast and isolated.

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VALID_REGISTER = {
  email: 'budi@restomap.id',
  password: 'password123',
  name: 'Budi Santoso',
  role: 'pengusaha' as const,
}

const HASHED_PASSWORD = '$argon2id$v=19$m=65536,t=3,p=4$fakehash'

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService

  beforeEach(() => {
    service = new AuthService(mockPrisma as any, 'test-jwt-secret')
    vi.clearAllMocks()
  })

  // ── Behavior 1 ─────────────────────────────────────────────────────────────
  it('returns token and user when registering with valid data', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null) // email not taken
    mockPrisma.user.create.mockResolvedValue({
      id: 'user_1',
      email: VALID_REGISTER.email,
      name: VALID_REGISTER.name,
      role: VALID_REGISTER.role,
      tier: 'free',
      password: HASHED_PASSWORD,
      googleId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await service.register(VALID_REGISTER)

    expect(result.token).toBeTruthy()
    expect(result.user.email).toBe(VALID_REGISTER.email)
    expect(result.user.name).toBe(VALID_REGISTER.name)
    expect(result.user.tier).toBe('free')
    // Password must never be returned
    expect((result.user as any).password).toBeUndefined()
  })

  // ── Behavior 2 ─────────────────────────────────────────────────────────────
  it('throws ConflictError when email is already registered', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user_existing',
      email: VALID_REGISTER.email,
    })

    await expect(service.register(VALID_REGISTER)).rejects.toThrow('EMAIL_TAKEN')
  })

  // ── Behavior 3 ─────────────────────────────────────────────────────────────
  it('throws ValidationError when password is shorter than 8 characters', async () => {
    await expect(
      service.register({ ...VALID_REGISTER, password: 'short' })
    ).rejects.toThrow('PASSWORD_TOO_SHORT')
  })

  // ── Behavior 4 ─────────────────────────────────────────────────────────────
  it('returns token when logging in with correct credentials', async () => {
    // We need a real argon2 hash for this test — use the service to create one
    const registered = await (async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockImplementation(async ({ data }: any) => ({
        id: 'user_1',
        ...data,
        tier: 'free',
        googleId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
      return service.register(VALID_REGISTER)
    })()

    // Now test login — findUnique returns user with the hashed password from register
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user_1',
      email: VALID_REGISTER.email,
      name: VALID_REGISTER.name,
      role: VALID_REGISTER.role,
      tier: 'free',
      password: mockPrisma.user.create.mock.calls[0][0].data.password,
      googleId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await service.login({
      email: VALID_REGISTER.email,
      password: VALID_REGISTER.password,
    })

    expect(result.token).toBeTruthy()
    expect(result.user.email).toBe(VALID_REGISTER.email)
  })

  // ── Behavior 5 ─────────────────────────────────────────────────────────────
  it('throws UnauthorizedError when password is wrong', async () => {
    // Use a real argon2 hash so argon2.verify() can run properly
    mockPrisma.user.findUnique.mockResolvedValueOnce(null)
    mockPrisma.user.create.mockImplementation(async ({ data }: any) => ({
      id: 'user_1',
      ...data,
      tier: 'free',
      googleId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
    await service.register(VALID_REGISTER)
    const realHash = mockPrisma.user.create.mock.calls[0][0].data.password

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user_1',
      email: VALID_REGISTER.email,
      password: realHash,
    })

    await expect(
      service.login({ email: VALID_REGISTER.email, password: 'wrongpassword' })
    ).rejects.toThrow('INVALID_CREDENTIALS')
  })

  // ── Behavior 6 ─────────────────────────────────────────────────────────────
  it('returns user when verifying a valid token', async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null)
    mockPrisma.user.create.mockImplementation(async ({ data }: any) => ({
      id: 'user_1',
      ...data,
      tier: 'free',
      googleId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    const { token } = await service.register(VALID_REGISTER)

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user_1',
      email: VALID_REGISTER.email,
      name: VALID_REGISTER.name,
      role: VALID_REGISTER.role,
      tier: 'free',
    })

    const user = await service.verifyToken(token)

    expect(user.email).toBe(VALID_REGISTER.email)
    expect(user.id).toBe('user_1')
  })

  // ── Behavior 7 ─────────────────────────────────────────────────────────────
  it('throws UnauthorizedError when token is invalid', async () => {
    await expect(
      service.verifyToken('invalid.token.here')
    ).rejects.toThrow('INVALID_TOKEN')
  })
})
