import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatCurrency, getOfferingTypeLabel } from '@/lib/utils'
import Link from 'next/link'

export default async function WatchlistPage() {
  const session = await auth()
  if (!session || session.user.role !== 'INVESTOR') redirect('/app/login')

  const items = await prisma.watchlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      offering: {
        select: { id: true, slug: true, title: true, type: true, status: true, shortDescription: true, totalRaisedCents: true, maximumRaiseCents: true, minimumInvestmentCents: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Watchlist</h1>
        <p className="text-gray-500 mt-1">Offerings you&apos;re tracking</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e5e7f0] p-12 text-center">
          <p className="text-gray-500 mb-4">Your watchlist is empty.</p>
          <Link href="/app/offerings" className="text-sm font-semibold" style={{ color: '#5271ff' }}>Browse offerings →</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map(({ offering }) => {
            const pct = Math.min(100, (Number(offering.totalRaisedCents) / Number(offering.maximumRaiseCents)) * 100)
            return (
              <div key={offering.id} className="bg-white rounded-2xl border border-[#e5e7f0] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900">{offering.title}</p>
                    <p className="text-xs text-gray-500">{getOfferingTypeLabel(offering.type)}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: offering.status === 'LIVE' ? '#10b981' : '#6b7280' }}>{offering.status}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{offering.shortDescription}</p>
                <div className="h-1.5 bg-[#f0f1f5] rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#5271ff' }} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Min: {formatCurrency(Number(offering.minimumInvestmentCents))}</p>
                  <Link href={`/app/offerings/${offering.slug}`} className="text-xs font-semibold" style={{ color: '#5271ff' }}>View →</Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
