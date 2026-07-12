import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function BDOfferingsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'BD_PARTNER') redirect('/app/login')

  const offerings = await prisma.offering.findMany({
    include: { issuer: { select: { companyName: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const statusColors: Record<string, string> = {
    DRAFT: '#6b7280', PENDING_REVIEW: '#f59e0b', APPROVED: '#3b82f6',
    LIVE: '#10b981', CLOSED: '#6b7280', CANCELLED: '#ef4444', CHANGES_REQUESTED: '#f59e0b',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">All Offerings</h1>
        <p className="text-gray-500 mt-1">Platform-wide offering management</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e5e7f0]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="divide-y divide-[#e5e7f0]">
          {offerings.map(o => (
            <div key={o.id} className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm font-semibold text-gray-900">{o.title}</p>
                <p className="text-xs text-gray-500">{o.issuer.companyName} · {o.type.replace('_', ' ')} · Goal: {formatCurrency(Number(o.maximumRaiseCents))}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white" style={{ background: statusColors[o.status] || '#6b7280' }}>
                  {o.status.replace('_', ' ')}
                </span>
                <Link href={`/app/bd/offerings/${o.id}/review`} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#e5e7f0] text-gray-600">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
