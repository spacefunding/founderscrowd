import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/api'
import { z } from 'zod'
import { calculateRegCFLimit } from '@/lib/utils'

const createInvestmentSchema = z.object({
  offeringId: z.string(),
  amountCents: z.number().int().positive(),
  paymentMethod: z.enum(['ACH', 'WIRE', 'CARD', 'CRYPTO']).optional().default('ACH'),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return apiError('AUTH_REQUIRED', 'Authentication required', 401)
  if (session.user.role !== 'INVESTOR') return apiError('FORBIDDEN', 'Investor account required', 403)

  try {
    const body = await req.json()
    const parsed = createInvestmentSchema.safeParse(body)
    if (!parsed.success) return apiError('VALIDATION_ERROR', parsed.error.issues[0].message, 422)

    const { offeringId, amountCents, paymentMethod } = parsed.data

    const offering = await prisma.offering.findUnique({ where: { id: offeringId } })
    if (!offering) return apiError('NOT_FOUND', 'Offering not found', 404)
    if (offering.status !== 'LIVE') return apiError('OFFERING_NOT_LIVE', 'This offering is not currently accepting investments', 400)

    if (amountCents < Number(offering.minimumInvestmentCents)) {
      return apiError('VALIDATION_ERROR', `Minimum investment is $${Number(offering.minimumInvestmentCents) / 100}`, 400)
    }

    const investor = await prisma.investorProfile.findUnique({ where: { userId: session.user.id } })
    if (!investor) return apiError('NOT_FOUND', 'Investor profile not found', 404)
    if (investor.kycStatus !== 'APPROVED') return apiError('KYC_REQUIRED', 'Identity verification required before investing', 403)

    if (offering.type === 'REG_CF') {
      const limit = calculateRegCFLimit(Number(investor.annualIncomeCents || 0), Number(investor.netWorthCents || 0))
      const ytdInvestments = await prisma.investment.aggregate({
        where: {
          investorId: session.user.id,
          status: { in: ['FUNDED', 'COMPLETED', 'COMMITTED', 'SIGNED'] },
          offering: { type: 'REG_CF' },
          createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) },
        },
        _sum: { amountCents: true },
      })
      const ytdTotal = Number(ytdInvestments._sum.amountCents || 0)
      if (ytdTotal + amountCents > limit) {
        return apiError(
          'INVESTMENT_LIMIT_EXCEEDED',
          `This investment would exceed your annual Reg CF limit. Remaining: $${((limit - ytdTotal) / 100).toFixed(2)}`,
          400
        )
      }
    }

    if (offering.type === 'REG_D_506C') {
      if (investor.accreditationStatus !== 'VERIFIED') {
        return apiError('ACCREDITATION_REQUIRED', 'Verified accreditation required for this offering', 403)
      }
    }

    const existingInvestment = await prisma.investment.findUnique({
      where: { investorId_offeringId: { investorId: session.user.id, offeringId } },
    })
    if (existingInvestment && !['CANCELLED', 'REFUNDED', 'FAILED'].includes(existingInvestment.status)) {
      return apiError('ALREADY_INVESTED', 'You already have an active investment in this offering', 400)
    }

    const unitCount = Math.floor(amountCents / Number(offering.pricePerUnitCents))

    const investment = await prisma.$transaction(async (tx) => {
      const inv = await tx.investment.create({
        data: {
          investorId: session.user.id,
          offeringId,
          status: 'COMMITTED',
          amountCents,
          unitCount,
          pricePerUnitCents: offering.pricePerUnitCents,
          paymentMethod,
          committedAt: new Date(),
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        },
      })

      if (offering.type === 'REG_CF') {
        const limit = calculateRegCFLimit(Number(investor.annualIncomeCents || 0), Number(investor.netWorthCents || 0))
        await tx.investmentLimitRecord.create({
          data: {
            investorId: session.user.id,
            investmentId: inv.id,
            annualIncomeCents: investor.annualIncomeCents || 0,
            netWorthCents: investor.netWorthCents || 0,
            calculatedLimitCents: limit,
            usedLimitCents: amountCents,
            remainingLimitCents: Math.max(0, limit - amountCents),
          },
        })
      }

      await tx.offering.update({
        where: { id: offeringId },
        data: {
          totalCommittedCents: { increment: amountCents },
          totalInvestors: { increment: 1 },
        },
      })

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'INVEST',
          resource: 'investment',
          resourceId: inv.id,
          metadata: { offeringId, amountCents, paymentMethod },
        },
      })

      return inv
    })

    return apiSuccess(investment, 201)
  } catch (err) {
    console.error(err)
    return apiError('SERVER_ERROR', 'Investment failed. Please try again.', 500)
  }
}

export async function GET() {
  const session = await auth()
  if (!session) return apiError('AUTH_REQUIRED', 'Authentication required', 401)

  try {
    const investments = await prisma.investment.findMany({
      where: { investorId: session.user.id },
      include: {
        offering: {
          select: {
            id: true, slug: true, title: true, type: true, status: true,
            heroImageUrl: true, totalRaisedCents: true, maximumRaiseCents: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return apiSuccess(investments)
  } catch (err) {
    console.error(err)
    return apiError('SERVER_ERROR', 'Failed to fetch investments', 500)
  }
}
