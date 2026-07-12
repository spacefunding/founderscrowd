import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['INVESTOR', 'ISSUER']),
  companyName: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return apiError('VALIDATION_ERROR', parsed.error.issues[0].message, 422)

    const { email, password, firstName, lastName, role, companyName } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return apiError('EMAIL_TAKEN', 'An account with this email already exists', 409)

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: { email, passwordHash, firstName, lastName, role },
      })
      if (role === 'INVESTOR') {
        await tx.investorProfile.create({ data: { userId: u.id } })
      } else if (role === 'ISSUER') {
        await tx.issuerProfile.create({
          data: { userId: u.id, companyName: companyName || '' },
        })
      }
      return u
    })

    return apiSuccess({ id: user.id, email: user.email, role: user.role }, 201)
  } catch (err) {
    console.error(err)
    return apiError('SERVER_ERROR', 'Registration failed', 500)
  }
}
