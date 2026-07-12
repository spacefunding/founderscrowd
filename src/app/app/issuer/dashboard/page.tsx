import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency, getOfferingTypeLabel } from '@/lib/utils'
import Link from 'next/link'
import { Plus, TrendingUp } from 'lucide-react'

export default async function IssuerDashboardPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ISSUER') redirect('/app/login')

  const issuer = await prisma.issuerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      offerings: {
        include: { investments: { select: { amountCents: true, status: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!issuer) redirect('/app/login')

  const statusColors: Record<string, string> = {
    DRAFT: '#6b7280', PENDING_REVIEW: '#f59e0b', APPROVED: '#3b82f6',
    LIVE: '#10b981', CLOSED: '#6b7280', CANCELLED: '#ef4444', CHANGES_REQUESTED: '#f59e0b',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{issuer.companyName}</h1>
          <p className="text-gray-500 mt-1">Manage your fundraising campaigns</p>
        </div>
        <Link href="/app/issuer/offerings/new" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm" style={{ background: '#5271ff' }}>
          <Plus size={16} /> New Offering
        </Link>
      </div>

      <div className="space-y-4">
        {issuer.offerings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e5e7f0] p-12 text-center">
            <TrendingUp size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-4">No offerings yet. Create your first raise.</p>
            <Link href="/app/issuer/offerings/new" className="text-sm font-semibold" style={{ color: '#5271ff' }}>Create offering →</Link>
          </div>
        ) : issuer.offerings.map(offering => {
          const raised = offering.investments.filter(i => !['CANCELLED','REFUNDED','FAILED'].includes(i.status)).reduce((s, i) => s + Number(i.amountCents), 0)
          const pct = Math.min(100, (raised / Number(offering.maximumRaiseCents)) * 100)
          return (
            <div key={offering.id} className="bg-white rounded-2xl border border-[#e5e7f0] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900">{offering.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{getOfferingTypeLabel(offering.type)}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white" style={{ background: statusColors[offering.status] || '#6b7280' }}>
                  {offering.status.replace('_', ' ')}
                </span>
              </div>
              <div className="h-1.5 bg-[#f0f1f5] rounded-full overflow-hidden mb-1.5">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#5271ff' }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatCurrency(raised)} raised</span>
                <span>Goal: {formatCurrency(Number(offering.maximumRaiseCents))}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
