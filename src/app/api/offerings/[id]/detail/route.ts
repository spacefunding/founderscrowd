import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const offering = await prisma.offering.findUnique({
      where: { id },
      select: {
        id: true, slug: true, title: true, type: true, status: true,
        securityType: true, shortDescription: true,
        minimumInvestmentCents: true, maximumRaiseCents: true, minimumRaiseCents: true,
        totalRaisedCents: true, totalInvestors: true, closeDate: true,
        pricePerUnitCents: true, valuationCapCents: true, discountRate: true,
      },
    })
    if (!offering) return apiError('NOT_FOUND', 'Offering not found', 404)
    return apiSuccess(offering)
  } catch (err) {
    console.error(err)
    return apiError('SERVER_ERROR', 'Failed to fetch offering', 500)
  }
}
