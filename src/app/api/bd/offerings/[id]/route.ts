import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'BD_PARTNER') return apiError('FORBIDDEN', 'BD Partner access required', 403)

  const { id } = await params
  try {
    const offering = await prisma.offering.findUnique({
      where: { id },
      include: {
        issuer: { include: { user: { select: { email: true, firstName: true, lastName: true } } } },
        documents: true,
        investments: { select: { amountCents: true, status: true } },
      },
    })
    if (!offering) return apiError('NOT_FOUND', 'Offering not found', 404)
    return apiSuccess(offering)
  } catch (err) {
    console.error(err)
    return apiError('SERVER_ERROR', 'Failed to fetch offering', 500)
  }
}
