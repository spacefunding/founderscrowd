import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency, getOfferingTypeLabel } from '@/lib/utils'

export default async function PortfolioPage() {
  const session = await auth()
  if (!session || session.user.role !== 'INVESTOR') redirect('/app/login')

  const investments = await prisma.investment.findMany({
    where: { investorId: session.user.id },
    include: {
      offering: {
        select: { title: true, type: true, status: true, totalRaisedCents: true, maximumRaiseCents: true, closeDate: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const statusColors: Record<string, string> = {
    COMMITTED: '#f59e0b', SIGNED: '#3b82f6', FUNDED: '#10b981',
    COMPLETED: '#6b7280', CANCELLED: '#ef4444', REFUNDED: '#6b7280', FAILED: '#ef4444',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
        <p className="text-gray-500 mt-1">All your investments in one place</p>
      </div>

      {investments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e7f0] p-12 text-center">
          <p className="text-gray-500 mb-4">You haven&apos;t made any investments yet.</p>
          <a href="/app/offerings" className="text-sm font-semibold" style={{ color: '#5271ff' }}>Browse offerings →</a>
        </div>
      ) : (
        <div className="space-y-3">
          {investments.map(inv => {
            const pct = Math.min(100, (Number(inv.offering.totalRaisedCents) / Number(inv.offering.maximumRaiseCents)) * 100)
            return (
              <div key={inv.id} className="bg-white rounded-2xl border border-[#e5e7f0] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-900">{inv.offering.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{getOfferingTypeLabel(inv.offering.type)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(Number(inv.amountCents))}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: statusColors[inv.status] || '#6b7280' }}>{inv.status}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-[#f0f1f5] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#5271ff' }} />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{pct.toFixed(0)}% of goal raised</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
