import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/api'
import { z } from 'zod'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status') || 'LIVE'

    const offerings = await prisma.offering.findMany({
      where: {
        status: status as never,
        type: type ? { equals: type as never } : { not: 'REG_D_506B' as never },
      },
      select: {
        id: true, slug: true, title: true, type: true, status: true,
        securityType: true, shortDescription: true, heroImageUrl: true,
        minimumInvestmentCents: true, maximumRaiseCents: true,
        totalRaisedCents: true, totalInvestors: true, closeDate: true,
        issuer: { select: { companyName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return apiSuccess(offerings)
  } catch (err) {
    console.error(err)
    return apiError('SERVER_ERROR', 'Failed to fetch offerings', 500)
  }
}

const createSchema = z.object({
  title: z.string().min(3),
  type: z.enum(['REG_CF', 'REG_A_PLUS', 'REG_D_506B', 'REG_D_506C']),
  securityType: z.enum(['EQUITY', 'DEBT', 'REVENUE_SHARE', 'SAFE', 'CONVERTIBLE_NOTE']),
  shortDescription: z.string().optional(),
  minimumInvestmentCents: z.number().int().positive(),
  maximumRaiseCents: z.number().int().positive(),
  minimumRaiseCents: z.number().int().positive(),
  pricePerUnitCents: z.number().int().positive().default(100),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('AUTH_REQUIRED', 'Authentication required', 401)
  if (session.user.role !== 'ISSUER') return apiError('FORBIDDEN', 'Issuer account required', 403)

  try {
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) return apiError('VALIDATION_ERROR', parsed.error.issues[0].message, 422)

    const issuer = await prisma.issuerProfile.findUnique({ where: { userId: session.user.id } })
    if (!issuer) return apiError('NOT_FOUND', 'Issuer profile not found', 404)

    const slug = slugify(parsed.data.title) + '-' + Date.now().toString(36)
    const offering = await prisma.offering.create({
      data: { ...parsed.data, issuerId: issuer.id, slug, status: 'DRAFT' },
    })
    return apiSuccess(offering, 201)
  } catch (err) {
    console.error(err)
    return apiError('SERVER_ERROR', 'Failed to create offering', 500)
  }
}
