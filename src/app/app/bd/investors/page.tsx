import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function BDInvestorsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'BD_PARTNER') redirect('/app/login')

  const investors = await prisma.user.findMany({
    where: { role: 'INVESTOR' },
    include: { investorProfile: { select: { kycStatus: true, accreditationStatus: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const kycColors: Record<string, string> = {
    APPROVED: '#10b981', PENDING_REVIEW: '#f59e0b', IN_PROGRESS: '#3b82f6',
    NOT_STARTED: '#6b7280', REJECTED: '#ef4444',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Investor Management</h1>
        <p className="text-gray-500 mt-1">KYC and accreditation status overview</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e7f0]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="divide-y divide-[#e5e7f0]">
          {investors.map(u => (
            <div key={u.id} className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold text-gray-900">{u.firstName} {u.lastName}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
                  style={{ background: kycColors[u.investorProfile?.kycStatus || 'NOT_STARTED'] || '#6b7280' }}>
                  KYC: {u.investorProfile?.kycStatus?.replace('_', ' ') || 'N/A'}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {u.investorProfile?.accreditationStatus?.replace('_', ' ') || ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
