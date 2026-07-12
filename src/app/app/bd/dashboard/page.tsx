import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function BDDashboardPage() {
  const session = await auth()
  if (!session || session.user.role !== 'BD_PARTNER') redirect('/app/login')

  const [pendingOfferings, liveOfferings, totalInvestors] = await Promise.all([
    prisma.offering.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.offering.count({ where: { status: 'LIVE' } }),
    prisma.investorProfile.count({ where: { kycStatus: 'APPROVED' } }),
  ])

  const recentOfferings = await prisma.offering.findMany({
    where: { status: { in: ['PENDING_REVIEW', 'LIVE', 'APPROVED'] } },
    include: { issuer: { select: { companyName: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const statusColors: Record<string, string> = {
    PENDING_REVIEW: '#f59e0b', APPROVED: '#3b82f6', LIVE: '#10b981',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Compliance Dashboard</h1>
        <p className="text-gray-500 mt-1">FINRA broker-dealer oversight</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending Review', value: pendingOfferings, color: '#f59e0b' },
          { label: 'Live Offerings', value: liveOfferings, color: '#10b981' },
          { label: 'KYC-Verified Investors', value: totalInvestors, color: '#5271ff' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#e5e7f0] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e7f0]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="p-5 border-b border-[#e5e7f0]">
          <h2 className="font-bold text-gray-900">Offerings Queue</h2>
        </div>
        <div className="divide-y divide-[#e5e7f0]">
          {recentOfferings.map(o => (
            <div key={o.id} className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold text-gray-900">{o.title}</p>
                <p className="text-xs text-gray-500">{o.issuer.companyName} · {o.type.replace('_', ' ')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white" style={{ background: statusColors[o.status] || '#6b7280' }}>
                  {o.status.replace('_', ' ')}
                </span>
                {o.status === 'PENDING_REVIEW' && (
                  <Link href={`/app/bd/offerings/${o.id}/review`} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: '#eef0ff', color: '#5271ff' }}>
                    Review
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
