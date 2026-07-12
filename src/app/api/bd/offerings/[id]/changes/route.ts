import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'BD_PARTNER') return apiError('FORBIDDEN', 'BD Partner access required', 403)

  const { id } = await params
  try {
    const offering = await prisma.offering.update({
      where: { id },
      data: { status: 'CHANGES_REQUESTED' },
    })
    await prisma.auditLog.create({
      data: { userId: session.user.id, action: 'REQUEST_CHANGES_OFFERING', resource: 'offering', resourceId: id },
    })
    return apiSuccess(offering)
  } catch (err) {
    console.error(err)
    return apiError('SERVER_ERROR', 'Failed to request changes', 500)
  }
}
