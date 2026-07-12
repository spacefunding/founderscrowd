import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api'

export async function GET() {
  const session = await auth()
  if (!session) return apiError('AUTH_REQUIRED', 'Authentication required', 401)

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, status: true, emailVerified: true, twoFactorEnabled: true,
        investorProfile: {
          select: {
            kycStatus: true, accreditationStatus: true, onboardingCompleted: true,
            annualIncomeCents: true, netWorthCents: true,
          },
        },
        issuerProfile: { select: { companyName: true, website: true } },
      },
    })
    if (!user) return apiError('NOT_FOUND', 'User not found', 404)
    return apiSuccess(user)
  } catch (err) {
    console.error(err)
    return apiError('SERVER_ERROR', 'Failed to fetch user', 500)
  }
}
