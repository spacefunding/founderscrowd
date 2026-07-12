import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ step: string }> }
) {
  const session = await auth()
  if (!session) return apiError('AUTH_REQUIRED', 'Authentication required', 401)
  if (session.user.role !== 'INVESTOR') return apiError('FORBIDDEN', 'Investor account required', 403)

  const { step } = await params
  const stepNum = parseInt(step)
  const body = await req.json()

  try {
    const investor = await prisma.investorProfile.findUnique({ where: { userId: session.user.id } })
    if (!investor) return apiError('NOT_FOUND', 'Investor profile not found', 404)

    const updateData: Record<string, unknown> = {}

    if (stepNum === 1) {
      updateData.addressLine1 = body.addressLine1
      updateData.addressLine2 = body.addressLine2
      updateData.city = body.city
      updateData.state = body.state
      updateData.zipCode = body.zipCode
    } else if (stepNum === 2) {
      updateData.dobEncrypted = body.dob
      updateData.ssnEncrypted = body.ssn
    } else if (stepNum === 3) {
      updateData.employmentStatus = body.employmentStatus
      updateData.annualIncomeCents = body.annualIncomeCents
      updateData.netWorthCents = body.netWorthCents
    } else if (stepNum === 4) {
      updateData.investmentExperience = body.investmentExperience
      updateData.riskTolerance = body.riskTolerance
    } else if (stepNum >= 6) {
      const isMock = process.env.MOCK_INTEGRATIONS === 'true' || process.env.MOCK_KYC === 'true'
      if (isMock) {
        updateData.kycStatus = 'APPROVED'
        updateData.amlRiskLevel = 'LOW'
        await prisma.kYCInquiry.create({
          data: {
            investorId: investor.id,
            externalId: `mock_${Date.now()}`,
            provider: 'persona_mock',
            status: 'completed',
            completedAt: new Date(),
            rawResponse: { mock: true },
          },
        })
        await prisma.aMLScreening.create({
          data: {
            investorId: investor.id,
            externalId: `mock_aml_${Date.now()}`,
            provider: 'sardine_mock',
            riskLevel: 'LOW',
            rawResponse: { mock: true, score: 10 },
          },
        })
      }
      if (stepNum === 8) {
        updateData.onboardingCompleted = true
      }
    }

    const updated = await prisma.investorProfile.update({
      where: { userId: session.user.id },
      data: updateData,
    })

    return apiSuccess({ step: stepNum, profile: updated })
  } catch (err) {
    console.error(err)
    return apiError('SERVER_ERROR', 'Failed to save step', 500)
  }
}
