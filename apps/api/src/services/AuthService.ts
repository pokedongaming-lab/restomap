import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import type { PrismaClient } from '@prisma/client'

// ─── Error Types ─────────────────────────────────────────────────────────────

export class AuthError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
  ) {
    super(code)
    this.name = 'AuthError'
  }
}

// ─── Public Types ─────────────────────────────────────────────────────────────

export type RegisterInput = {
  email: string
  password: string
  name: string
  role: 'pengusaha' | 'konsultan' | 'franchise'
}

export type LoginInput = {
  email: string
  password: string
}

export type AuthUser = {
  id: string
  email: string
  name: string
  role: string
  tier: string
}

export type AuthResult = {
  token: string
  user: AuthUser
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class AuthService {
  constructor(
    private prisma: Pick<PrismaClient, 'user'>,
    private jwtSecret: string,
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    // Behavior 3: password too short
    if (input.password.length < 8) {
      throw new AuthError('PASSWORD_TOO_SHORT', 400, 'Password must be at least 8 characters')
    }

    // Behavior 2: email already taken
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    })
    if (existing) {
      throw new AuthError('EMAIL_TAKEN', 409, 'Email is already registered')
    }

    const hashedPassword = await argon2.hash(input.password)

    const user = await this.prisma.user.create({
      data: {
        email:    input.email,
        name:     input.name,
        role:     input.role,
        password: hashedPassword,
      },
    })

    const token = this.signToken(user.id)

    return {
      token,
      user: this.toPublicUser(user),
    }
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    })

    // Behavior 5: wrong credentials (don't reveal whether email exists)
    if (!user || !user.password) {
      throw new AuthError('INVALID_CREDENTIALS', 401, 'Invalid email or password')
    }

    const passwordValid = await argon2.verify(user.password, input.password)
    if (!passwordValid) {
      throw new AuthError('INVALID_CREDENTIALS', 401, 'Invalid email or password')
    }

    const token = this.signToken(user.id)

    return {
      token,
      user: this.toPublicUser(user),
    }
  }

  async verifyToken(token: string): Promise<AuthUser> {
    // Behavior 7: invalid token
    let payload: { userId: string }
    try {
      payload = jwt.verify(token, this.jwtSecret) as { userId: string }
    } catch {
      throw new AuthError('INVALID_TOKEN', 401, 'Token is invalid or expired')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      throw new AuthError('INVALID_TOKEN', 401, 'User not found')
    }

    return this.toPublicUser(user)
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  private signToken(userId: string): string {
    return jwt.sign({ userId }, this.jwtSecret, { expiresIn: '7d' })
  }

  private toPublicUser(user: any): AuthUser {
    return {
      id:    user.id,
      email: user.email,
      name:  user.name,
      role:  user.role,
      tier:  user.tier,
    }
  }
}
